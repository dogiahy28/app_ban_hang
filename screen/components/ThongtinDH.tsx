import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Alert } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import anh_sp from './Hinhanh';
import axios from 'axios';

type Props = {
    navigation: any;
    route: any;
};

const ThongtinDH = ({ route, navigation }: Props) => {
    const { MA_HD } = route.params;
    const [donHangInfo, setDonHangInfo] = useState<any>(null);
    const [TEN_KH, setTEN_KH] = useState('');
    const [SDT_KH, setSDT_KH] = useState('');
    const [EMAIL_KH, setEMAIL_KH] = useState('');
    const [DIA_CHI_KH, setDIA_CHI_KH] = useState('');
    const [error, setError] = useState<string>('');
    const [canceledOrder, setCanceledOrder] = useState<boolean>(false);
    const [cancelTime, setCancelTime] = useState<string | null>(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch thông tin đơn hàng từ API thongtin_donhang
                const responseDonHang = await axios.post('http://192.168.56.1:3000/thongtin_donhang', { MA_HD });
                const donHangData = responseDonHang.data;

                // Fetch chi tiết đơn hàng từ API chitiet_hd
                const responseChiTietHD = await axios.post('http://192.168.56.1:3000/chitiet_hd', { MA_HD });
                const chiTietHDData = responseChiTietHD.data;

                // Set dữ liệu cho state
                setDonHangInfo({
                    ...donHangData,
                    chiTietHD: chiTietHDData
                });
            } catch (error) {
                console.error('Error fetching order information:', error);
                setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.');
            }
        };

        fetchData();
    }, [MA_HD, canceledOrder]);

    useEffect(() => {
        const getCustomerData = async () => {
            try {
                const TEN_KH_value = await AsyncStorage.getItem('TEN_KH');
                const SDT_KH_value = await AsyncStorage.getItem('SDT_KH');
                const EMAIL_KH_value = await AsyncStorage.getItem('EMAIL_KH');
                const DIA_CHI_KH_value = await AsyncStorage.getItem('DIA_CHI_KH');
                if (TEN_KH_value !== null && SDT_KH_value !== null && EMAIL_KH_value !== null && DIA_CHI_KH_value !== null) {
                    setTEN_KH(TEN_KH_value);
                    setSDT_KH(SDT_KH_value);
                    setEMAIL_KH(EMAIL_KH_value);
                    setDIA_CHI_KH(DIA_CHI_KH_value);
                }
            } catch (error) {
                console.error('Error getting customer data:', error);
                setError('Không thể tải thông tin khách hàng. Vui lòng thử lại sau.');
            }
        };
        getCustomerData();
    }, []);

    if (error) {
        return (
            <View style={styles.container}>
                <Text>{error}</Text>
            </View>
        );
    }

    if (!donHangInfo) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    const renderProductImage = (item: any) => {
        const index = item.MA_SP - 1;
        const imageSource = anh_sp[index % anh_sp.length].source;
        const imageId = anh_sp[index % anh_sp.length].id;

        return (
            <Image key={imageId} source={imageSource} style={{ width: 100, height: 100 }} />
        );
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    const saveNotification = async (MA_HD: string) => {
        try {
            // Tạo một key unique cho thông báo
            const notificationKey = `orderNotification_${MA_HD}`;
            // Lưu thông báo vào AsyncStorage
            await AsyncStorage.setItem(notificationKey, `đã được bạn yêu cầu hủy thành công.`);
            // Cập nhật số lượng thông báo chưa đọc và lưu vào AsyncStorage
            const newUnreadNotificationsCount = unreadNotifications + 1;
            setUnreadNotifications(newUnreadNotificationsCount);
            await AsyncStorage.setItem('unreadNotifications', newUnreadNotificationsCount.toString());

        } catch (error) {
            console.error('Error saving notification:', error);
        }
    };

    const handleCancelOrder = async () => {
        Alert.alert(
            'Xác nhận hủy đơn hàng',
            'Bạn có chắc chắn muốn hủy đơn hàng này?',
            [
                {
                    text: 'Đóng',
                    style: 'cancel',
                },
                {
                    text: 'Đồng ý',
                    onPress: async () => {
                        try {
                            const response = await axios.post('http://192.168.56.1:3000/huy_don_hang', { MA_HD });
                            Alert.alert('Thông báo', 'Đơn hàng đã được hủy thành công.');
                            // Cập nhật trạng thái và mốc thời gian cập nhật mới
                             // Cập nhật trạng thái và mốc thời gian cập nhật mới
                            const newDonHangInfo = {
                                ...donHangInfo,
                                TRANG_THAI_HD: 'Đã hủy',
                            };
                            setDonHangInfo(newDonHangInfo);

                            // Lưu thời gian hủy đơn hàng
                            setCancelTime(new Date().toISOString());

                            // Lưu thông báo vào AsyncStorage
                            saveNotification(MA_HD);

                            // Điều hướng về màn hình cá nhân
                            setCanceledOrder(true);
                            navigation.navigate('CaNhan');
                        } catch (error) {
                            console.error('Error canceling order:', error);
                            Alert.alert('Thông báo', 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };


    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic1} onPress={() => navigation.goBack()} />
                <View style={styles.group}>
                    <Text style={{ color: 'black', fontSize: 24, top: 5, fontWeight: 'bold' }}>
                        Chi tiết đơn hàng</Text>
                </View>
            </View>

            <ScrollView style={{ flexGrow: 1 }}>
                <View style={styles.ctn}>
                    <Text style={{ fontSize: 23, color: 'black', fontWeight: 'bold', left: 2 }}>{donHangInfo?.TRANG_THAI_HD}</Text>
                    {donHangInfo?.TRANG_THAI_HD === "Đang vận chuyển" && (
                        <Text style={{ top: 3, fontSize: 16, }}>Đơn hàng của bạn đang trên đường vận chuyển đến bạn. Đơn hàng sẽ sớm được giao đến bạn.</Text>
                    )}
                    {donHangInfo?.TRANG_THAI_HD === "Đang xử lý" && (
                        <Text style={{ top: 3, fontSize: 16, }}>Thanh toán bằng hình thức thanh toán khi nhận hàng. Kiện hàng của bạn sẽ được giao sớm.</Text>
                    )}
                    {donHangInfo?.TRANG_THAI_HD === "Đã giao" && (
                        <Text style={{ top: 3, fontSize: 16, }}>Đơn hàng của bạn đã được giao thành công.</Text>
                    )}
                    {donHangInfo?.TRANG_THAI_HD === "Đã hủy" && (
                        <Text style={{ top: 3, fontSize: 16, }}>Đơn hàng của bạn đã được hủy thành công.</Text>
                    )}

                    {cancelTime && (
                        <Text style={{ top: 3, fontSize: 16 }}>Hủy vào lúc: {formatDate(cancelTime)}</Text>
                    )}
                </View>
                <View style={styles.ctn2}>
                    <Text style={{ top: 10, fontSize: 20, color: 'black', fontWeight: 'bold' }}><Icon name="truck" style={styles.ic10} />
                        Thông tin vận chuyển</Text>
                    <Text style={{ left: 25, top: 14, fontSize: 19 }}>Giao Hàng Nhanh</Text>
                    <Text style={{ left: 25, top: 17, fontSize: 17, color: 'green' }}>Đặt hàng thành công</Text>
                    <Text style={{ left: 25, top: 22, fontSize: 16, bottom: 10 }}>{formatDate(donHangInfo?.NGAY_LAP)}</Text>
                </View>
                <View style={styles.ctn3}>
                    <Text style={{ top: 10, fontSize: 20, color: 'black', fontWeight: 'bold', left: 5, }}><Icon name="location-dot" style={styles.ic10} />
                        Địa chỉ nhận hàng</Text>
                    <Text style={{ left: 25, top: 14, fontSize: 18 }}>{TEN_KH}</Text>
                    <Text style={{ left: 25, top: 17, fontSize: 17 }}>{SDT_KH} | {EMAIL_KH}</Text>
                    <Text style={{ left: 25, top: 20, fontSize: 17 }}>{DIA_CHI_KH}</Text>
                </View>
                <Text></Text>
                <View style={styles.chiTietHDContainer2}>
                    {donHangInfo?.chiTietHD && donHangInfo?.chiTietHD.length > 0 ? (
                        donHangInfo.chiTietHD.map((item: any, index: number) => (
                            <TouchableOpacity key={index} style={styles.chiTietHDItem} onPress={() => (navigation.navigate('ChiTiet', { item }))}>
                                <View>
                                    {renderProductImage(item)}
                                </View>
                                <View style={styles.productInfo}>
                                    <Text style={{ fontSize: 17, color: 'black', left: 10 }}>{item?.TEN_SP}</Text>
                                    <Text style={{ top: 5, fontSize: 16, left: 10 }}>Số lượng: {item?.SO_LUONG_MUA}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text>Không có chi tiết sản phẩm nào.</Text>
                    )}
                    {donHangInfo?.TRANG_THAI_HD === "Đã giao" && (
                        <Text style={{ fontSize: 19, color: 'black', left: 10, fontWeight: 'bold' }}>Đã thanh toán: <Text style={{ color: 'red' }}>{parseFloat(donHangInfo?.THANH_TIEN).toLocaleString('vi-VN')}đ</Text></Text>
                    )}

                    {donHangInfo?.TRANG_THAI_HD !== "Đã giao" && (
                        <Text style={{ fontSize: 19, color: 'black', left: 10, fontWeight: 'bold' }}>Thành tiền: <Text style={{ color: 'red' }}>{parseFloat(donHangInfo?.THANH_TIEN).toLocaleString('vi-VN')}đ</Text></Text>
                    )}
                </View>
                {donHangInfo?.TRANG_THAI_HD === "Đang xử lý" && (
                    <TouchableOpacity onPress={handleCancelOrder} style={styles.cancelButton}>
                        <Text style={{fontSize:18, color: '#DC2F2F', fontWeight: 'bold' }}>Hủy đơn hàng</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
        height: 65,
    },

    container: {
        backgroundColor: '#D9D9D9',
        height: 680,
    },

    ctn: {
        backgroundColor: '#EE726F',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 7,
    },

    ctn2: {
        backgroundColor: 'white',
        paddingBottom: 30,
        paddingLeft: 7,
        borderBottomWidth: 0.3,
        borderBottomColor: 'black',
    },

    ctn3: {
        backgroundColor: 'white',
        paddingBottom: 30,
        paddingLeft: 7,
        borderBottomWidth: 0.3,
        borderBottomColor: 'black',
    },

    footer: {
        backgroundColor: '#D9D9D9',
        height: 70,
    },

    group: {
        marginTop: 12,
        marginLeft: 55,
        marginRight: 30,
        zIndex: 10,
        fontSize: 20,
    },

    btn: {
        backgroundColor: '#D9D9D9',
        marginTop: 5,
        marginLeft: 185,
        alignItems: 'center',
        height: 35,
        width: 60,
        borderRadius: 3,
        position: 'absolute',
        zIndex: 1000,
        textAlign: `center`,
    },

    btn1: {
        backgroundColor: 'white',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        height: 52,
        width: 140,
        position: 'absolute',
        zIndex: 1000,
    },

    btn2: {
        backgroundColor: '#DC2F2F',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        height: 52,
        width: 160,
        position: 'absolute',
        zIndex: 1000,
    },

    btn3: {
        backgroundColor: '#D9D9D9',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        height: 50,
        width: 150,
        position: 'absolute',
        zIndex: 1000,
        top: 85,
    },

    ic: {
        fontSize: 22,
        color: '#DC2F2F',
        position: 'absolute',
        zIndex: 10000000,
        top: 10,
        left: 10,
    },

    ic1: {
        fontSize: 28,
        color: '#DC2F2F',
        position: 'absolute',
        zIndex: 10000000,
        top: 20,
        left: 10,
    },

    ic10: {
        fontSize: 19,
        color: '#DC2F2F',
        position: 'absolute',
        zIndex: 10000000,
        top: 20,
        left: 10,
    },

    ic5: {
        fontSize: 22,
        color: '#DC2F2F',
        position: 'absolute',
        zIndex: 10000000,
        top: 20,
        left: 10,
    },

    ic4: {
        fontSize: 24,
        color: 'black',
        position: 'absolute',
        zIndex: 10000000,
        top: 35,
        left: 5,
    },

    ic3: {
        fontSize: 26,
        color: 'black',
        position: 'absolute',
        zIndex: 10000000,
        top: 24,
        right: 67,
    },

    foot1: {
        left: 5,
        top: 12,
        fontSize: 20,
        position: 'absolute',
    },

    foot2: {
        left: 95,
        top: 5,
        fontSize: 20,
        position: 'absolute',
    },

    foot3: {
        left: 243,
        top: 5,
        fontSize: 20,
        position: 'absolute',
    },

    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        height: 150,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        top: 40,
    },

    productName: {
        fontWeight: 'bold',
        fontSize: 16,
        width: 260,
        top: 10,
    },

    selectButton: {
        fontSize: 28,
        color: 'black',
        fontWeight: 'bold',
        marginRight: 10,
        textAlign: 'center',
        top: 62,
    },

    ic2: {
        fontSize: 30,
        color: '#DC2F2F',
        position: 'absolute',
        zIndex: 10000000,
        top: 22,
        right: 20,
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    item: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: 'white',
        padding: 10,
        marginBottom: 10,
    },

    chiTietHDContainer: {
    },

    chiTietHDContainer2: {
        backgroundColor: 'white',
    },

    chiTietHDTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    chiTietHDItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 20,
        marginBottom: 5,
    },
    productImage: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    productInfo: {
        flex: 1,
        padding: 10,
    },

    cancelButton: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        marginHorizontal: 20,
        borderRadius: 5,
        borderWidth:2,
        borderColor:'#DC2F2F',
        marginTop: 10,
        width:200,
        left:80,
    },
});

export default ThongtinDH;
