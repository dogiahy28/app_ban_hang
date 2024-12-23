import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Alert} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import anh_sp from './Hinhanh';
import axios from 'axios';

type Product = {
    TEN_SP: string;
    quantity: number;
    GIA_BAN: string;
};

type Props = {
    route: { params: { selectedProducts: Product[] } };
    navigation: any;
};

const Thanhtoan = ({ route, navigation }: Props) => {
    // Nhận các sản phẩm được chọn từ props route
    const { selectedProducts } = route.params;
    const [MA_CCCD, setMA_CCCD] = useState('');
    const [TEN_KH, setTEN_KH] = useState('');
    const [SDT_KH, setSDT_KH] = useState('');
    const [EMAIL_KH, setEMAIL_KH] = useState('');
    const [DIA_CHI_KH, setDIA_CHI_KH] = useState('');
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [MA_HD, setMA_HD] = useState('');

    useEffect(() => {
        getUnreadNotificationsCount();
    }, []);

    const getUnreadNotificationsCount = async () => {
        try {
            const unreadNotificationsCount = await AsyncStorage.getItem('unreadNotifications');
            if (unreadNotificationsCount !== null) {
                setUnreadNotifications(parseInt(unreadNotificationsCount));
            }
        } catch (error) {
            console.error('Error getting unread notifications count:', error);
        }
    };

    useEffect(() => {
        const getCustomerData = async () => {
            try {
                const MA_CCCD_value = await AsyncStorage.getItem('MA_CCCD');
                const TEN_KH_value = await AsyncStorage.getItem('TEN_KH');
                const SDT_KH_value = await AsyncStorage.getItem('SDT_KH');
                const EMAIL_KH_value = await AsyncStorage.getItem('EMAIL_KH');
                const DIA_CHI_KH_value = await AsyncStorage.getItem('DIA_CHI_KH');
                if (MA_CCCD_value !== null && TEN_KH_value !== null && SDT_KH_value !== null && EMAIL_KH_value !== null && DIA_CHI_KH_value !== null) {
                    setMA_CCCD(MA_CCCD_value);
                    setTEN_KH(TEN_KH_value);
                    setSDT_KH(SDT_KH_value);
                    setEMAIL_KH(EMAIL_KH_value);
                    setDIA_CHI_KH(DIA_CHI_KH_value);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getCustomerData();
    }, []);

    // Function để tính tổng số tiền thanh toán
    const calculateTotalPayment = () => {
        let totalPayment = 0;
        selectedProducts.forEach((product: any) => {
            totalPayment += product.GIA_BAN * product.quantity;
        });
        return totalPayment;
    };

    const renderProductImage = (item: any) => {
        const index = item.MA_SP - 1;
        const imageSource = anh_sp[index % anh_sp.length].source;
        const imageId = anh_sp[index % anh_sp.length].id;

        return (
            <Image key={imageId} source={imageSource} style={{ width:120, height: 120 }} />
        );
    };

    //Hàm xử lý đặt hàng
    const placeOrder = async () => {
        try {
            // Tính tổng số tiền thanh toán
            const totalPayment = calculateTotalPayment();

            // Gửi dữ liệu đặt hàng đến API
            const orderResponse = await axios.post('http://192.168.56.1:3000/order', {
                MA_CCCD: MA_CCCD,
                TEN_KH: TEN_KH,
                SDT_KH: SDT_KH,
                EMAIL_KH: EMAIL_KH,
                DIA_CHI_KH: DIA_CHI_KH,
                selectedProducts: selectedProducts,
            });
            // Xử lý kết quả trả về từ API
            console.log(orderResponse.data);

            // Lưu mã đơn hàng vào state
            setMA_HD(orderResponse.data.MA_HD);

            // Lưu thông tin thông báo vào AsyncStorage
            const MA_HD = orderResponse.data.MA_HD;
            await AsyncStorage.setItem('orderNotification_' + MA_HD, 'đã được đặt thành công. Cảm ơn bạn đã mua hàng!. Chúng tôi sẽ sớm chuẩn bị và vận chuyển đơn hàng đến bạn.');

            // Cập nhật số lượng thông báo chưa đọc và lưu vào AsyncStorage
            const newUnreadNotificationsCount = unreadNotifications + 1;
            setUnreadNotifications(newUnreadNotificationsCount);
            await AsyncStorage.setItem('unreadNotifications', newUnreadNotificationsCount.toString());

            // Hiển thị thông báo thành công
            Alert.alert('Thành công', 'Đặt hàng thành công. Cảm ơn bạn đã mua hàng!', [
                {
                    text: 'Tiếp tục mua hàng',
                    onPress: () => navigation.navigate('TrangChu'), // Chuyển hướng đến màn hình TrangChu
                },
                {
                    text: 'Xem đơn hàng',
                    onPress: () => navigation.navigate('ThongtinDH', { MA_HD: MA_HD }), // Chuyển hướng đến màn hình ThongtinDH với mã đơn hàng
                },
            ]);
        } catch (error) {
            // Xử lý lỗi
            console.error('Error placing order: ', error);
            // Hiển thị thông báo lỗi
            Alert.alert('Error', 'Đặt hàng thất bại. Vui lòng thử lại.');
        }
    };


    return (
        <View>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic1} onPress={() => navigation.goBack()} />
                <View style={styles.group}>
                    <Text style={{ color: 'black', fontSize: 24, top: 5, fontWeight: 'bold' }}>
                        Thanh toán</Text>
                </View>
            </View>
            <View style={styles.container}>
                <Text style={{color:'black', fontSize: 20, marginBottom: 10, marginLeft: 10}}>
                    <Icon name="location-dot" style={styles.ic5}/> Địa chỉ nhận hàng</Text>
                <Text style={{left:10,fontSize:16,}}>{TEN_KH} | {SDT_KH} | {EMAIL_KH}</Text>
                <Text style={{left:10,fontSize:16,}}>{DIA_CHI_KH}</Text>

                <Text style={{color:'black', fontSize: 19, marginTop: 10, marginBottom: 10, marginLeft: 10}}>
                    <Icon name="cube" style={styles.ic5}/> Thông tin sản phẩm</Text>
                <FlatList
                    data={selectedProducts}
                    renderItem={({ item }) => (
                        <ScrollView>
                            <View style={styles.cartItem}>
                                    {renderProductImage(item)}
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.productName}>{item.TEN_SP}</Text>
                                    <Text style={{fontWeight:'bold', fontSize:15, top:10}}>{parseFloat(item.GIA_BAN).toLocaleString('vi-VN')}đ</Text>
                                    <View>
                                        <Text style={{fontSize:16, top:20,marginRight:10 }}>Số lượng: {item.quantity} </Text>
                                    </View>
                                </View>
                            </View>
                        </ScrollView>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
                {/* <Text style={{color:'black', fontSize: 18, marginTop: 10, marginBottom: 10, marginLeft: 10}}>
                    <Icon name="money-check-dollar" style={styles.ic5}/> Phương thức thanh toán</Text>
                <Text style={{color:'black', fontSize: 16, marginBottom: 10, marginLeft: 15}}>
                    <Icon name="minus"/> Thanh toán khi nhận hàng</Text> */}
            </View>
            <View style={styles.footer}>
                <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold', top: 18, left: 20 }}>
                    Tổng thanh toán: <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}}>
                    {calculateTotalPayment().toLocaleString('vi-VN')}đ</Text>
                </Text>
                <View style={styles.foot3}>
                <TouchableOpacity style={styles.btn2} onPress={placeOrder}>
                    <Text style={{ textAlign: 'center', top: 12, fontWeight: 'bold', fontSize: 18, color: 'white' }}>
                        Đặt hàng
                    </Text>
                </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header:{
        backgroundColor:'white',
        height:65,
    },

    container:{
        backgroundColor:'white',
        height:554,
    },

    footer:{
        backgroundColor:'#D9D9D9',
        height:70,
    },

    group:{
        marginTop:12,
        marginLeft:55,
        marginRight:30,
        zIndex:10,
        fontSize:20,
    },

    btn:{
        backgroundColor:'#D9D9D9',
        marginTop:5,
        marginLeft:185,
        alignItems:'center',
        height:35,
        width:60,
        borderRadius:3,
        position:'absolute',
        zIndex:1000,
        textAlign:`center`,
    },

    btn1:{
        backgroundColor:'white',
        alignItems:'center',
        paddingLeft:20,
        paddingRight:20,
        height:52,
        width:140,
        position:'absolute',
        zIndex:1000,
        // textAlign:`center`,
    },

    btn2:{
        backgroundColor:'#DC2F2F',
        alignItems:'center',
        paddingLeft:20,
        paddingRight:20,
        height:52,
        width:160,
        position:'absolute',
        zIndex:1000,
        // textAlign:`center`,
    },

    btn3:{
        backgroundColor:'#D9D9D9',
        alignItems:'center',
        paddingLeft:20,
        paddingRight:20,
        height:50,
        width:150,
        position:'absolute',
        zIndex:1000,
        // textAlign:`center`,
        top:85,
    },

    ic:{
        fontSize:22,
        color:'#DC2F2F',
        position:'absolute',
        zIndex:10000000,
        top:10,
        left:10,
    },

    ic1:{
        fontSize:28,
        color:'#DC2F2F',
        position:'absolute',
        zIndex:10000000,
        top:20,
        left:10,
    },

    ic5:{
        fontSize:22,
        color:'#DC2F2F',
        position:'absolute',
        zIndex:10000000,
        top:20,
        left:10,
    },

    ic4:{
        fontSize:24,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:35,
        left:5,
    },

    ic3:{
        fontSize:26,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:24,
        right:67,
    },

    foot1:{
        left:5,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot2:{
        left:95,
        top:5,
        fontSize:20,
        position:'absolute',
    },

    foot3:{
        left:243,
        top:5,
        fontSize:20,
        position:'absolute',
    },

    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        // alignItems: 'center',
        padding: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },

    emptyContainer: {
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        height:150,
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
        top:10,
    },

    selectButton: {
        fontSize: 28,
        color: 'black',
        fontWeight: 'bold',
        marginRight: 10,
        textAlign: 'center',
        top:62,
    },

    ic2:{
        fontSize:30,
        color:'#DC2F2F',
        position:'absolute',
        zIndex:10000000,
        top:22,
        right:20,
    },

    selectAllButton: {
        fontSize: 28,
        color: 'black',
        zIndex:10000001,
        position:'absolute',
        top:22,
        right:43,
    },

    deleteAllButton: {
        fontSize: 23,
        color: 'black',
        zIndex:10000001,
        position:'absolute',
        top:24,
        right:10,
    },

});

export default Thanhtoan;
