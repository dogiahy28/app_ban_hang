import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Alert} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import anh_sp from './Hinhanh';
import axios from 'axios';

interface DonHang {
    MA_HD: number;
    NGAY_LAP: string;
    THANH_TIEN: string;
    TRANG_THAI_HD: string;
    THOI_GIAN_CAP_NHAT: string;
    // Thêm các thuộc tính khác nếu cần
}

interface ChiTietHD {
    MA_SP: number;
    TEN_SP: string;
    SO_LUONG_MUA: number;
    // Thêm các thuộc tính khác nếu cần
}

type Props = {
    navigation: any;
};

const Donhang = ({ navigation }: Props) => {
    const [donHangList, setDonHangList] = useState<DonHang[]>([]);
    const [loading, setLoading] = useState(true);
    const [MA_CCCD, setMA_CCCD] = useState('');
    // Thêm các trạng thái đơn hàng vào mảng để người dùng có thể chọn
    const TRANG_THAI_DON_HANG = ['Đang xử lý', 'Đang vận chuyển', 'Đã giao', 'Đã hủy'];
    // Thêm state để lưu trữ trạng thái đơn hàng được chọn
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    
    // Định nghĩa hàm lọc danh sách đơn hàng dựa trên trạng thái được chọn
    const filterDonHangList = (status: string | null) => {
        if (status === null) {
            return donHangList; // Trả về danh sách đơn hàng gốc nếu không có trạng thái nào được chọn
        }
        return donHangList.filter(donHang => donHang.TRANG_THAI_HD === status);
    };


    useEffect(() => {
        const getCustomerData = async () => {
            try {
                const MA_CCCD_value = await AsyncStorage.getItem('MA_CCCD');
                if (MA_CCCD_value !== null) {
                    setMA_CCCD(MA_CCCD_value);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getCustomerData();
    }, []);

    useEffect(() => {
        const fetchDonHangList = async () => {
            if (MA_CCCD) { // Chỉ gửi yêu cầu khi MA_CCCD có giá trị
                try {
                    const response = await axios.post('http://192.168.56.1:3000/donhang', { MA_CCCD });
                    setDonHangList(response.data);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching don hang list:', error);
                    setLoading(false);
                }
            }
        };

        fetchDonHangList();
    }, [MA_CCCD]);

    if (loading) {
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
            <Image key={imageId} source={imageSource} style={{ width:120, height: 120 }} />
        );
    };
    
    const ChiTietChiTietHD = ({ MA_HD }: { MA_HD: number }) => {
        const [chiTietHDList, setChiTietHDList] = useState<ChiTietHD[]>([]);
    
        useEffect(() => {
            const fetchChiTietHDList = async () => {
                try {
                    const response = await axios.post('http://192.168.56.1:3000/chitiet_hd', { MA_HD });
                    setChiTietHDList(response.data);
                } catch (error) {
                    console.error('Error fetching chi tiet hoa don list:', error);
                }
            };
    
            fetchChiTietHDList();
        }, [MA_HD]);
    
        return (
            <View style={styles.chiTietHDContainer}>
                {/* <Text style={styles.chiTietHDTitle}>Sản phẩm trong đơn hàng:</Text> */}
                {chiTietHDList.map((chiTietHD, index) => (
                    <View key={index} style={styles.chiTietHDItem}>
                            {renderProductImage(chiTietHD)}
                        <View style={styles.productInfo}>
                            <Text style={{color:'black',fontSize:17,}}>
                                {chiTietHD.TEN_SP}</Text>
                            <Text style={{top:7,fontSize:16,}}>
                                Số lượng: {chiTietHD.SO_LUONG_MUA}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    };
    
    //Định dạng thời gian lập hóa đơn
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    };

    // Sắp xếp mảng donHangList theo thời gian tạo mới nhất
    const sortedDonHangList = donHangList.sort((a, b) => {
        const dateA = new Date(a.NGAY_LAP).getTime();
        const dateB = new Date(b.NGAY_LAP).getTime();
        return dateB - dateA;
    });

    const handleOrderPress = (MA_HD: number) => {
        navigation.navigate('ThongtinDH', { MA_HD });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic1} onPress={() => navigation.goBack()} />
                <View style={styles.group}>
                    <Text style={{ color: 'black', fontSize: 24, top: 5, fontWeight: 'bold' }}>
                        Đơn mua</Text>
                </View>
            </View>
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TRANG_THAI_DON_HANG.map((status, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedStatus(status)}
                            style={selectedStatus === status ? styles.selectedFilterButton : styles.filterButton}>
                            <Text style={styles.filterText}>{status}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Kiểm tra nếu không có đơn hàng tương ứng với trạng thái đơn hàng đang chọn */}
            {filterDonHangList(selectedStatus ?? null).length === 0 ? (
                <View style={styles.emptyContainer}>
                    {/* <Image style={{height:50}} source={require('../../assets/image/no-order.png')}/> */}
                    <Icon name="file-lines" style={{fontSize:110,top:30,}} onPress={() => navigation.goBack()} />
                    <Text style={styles.emptyText}>Chưa có đơn hàng.</Text>
                </View>
            ) : (
                // Sử dụng danh sách đơn hàng đã lọc
                <FlatList
                    data={filterDonHangList(selectedStatus ?? null)}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleOrderPress(item.MA_HD)}>
                            <View style={styles.item}>
                                <Text style={{ color: 'red', fontSize: 18 }}>
                                    {item.TRANG_THAI_HD}</Text>
                                <Text style={{ top: 5, fontSize: 16 }}>
                                    Ngày đặt: {formatDate(item.NGAY_LAP)}</Text>
                                <ChiTietChiTietHD MA_HD={item.MA_HD} />
                                <Text style={{ top: 5, left: 180, right: 5, fontSize: 18 }}>
                                    <Icon name="dollar-sign" style={styles.ic10} onPress={() => navigation.goBack()} />
                                    Thành tiền: <Text style={{ color: 'red' }}>{parseFloat(item.THANH_TIEN).toLocaleString('vi-VN')}đ</Text></Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.MA_HD.toString()}
                />
            )}
            {/* {donHangList.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Không có đơn hàng nào được tìm thấy.</Text>
                </View>
            ) : (
                <FlatList
                    data={sortedDonHangList}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => handleOrderPress(item.MA_HD)}>
                            <View style={styles.item}>
                                <Text style={{ color: 'red', fontSize: 18 }}>
                                    {item.TRANG_THAI_HD}</Text>
                                <Text style={{ top: 5, fontSize: 16 }}>
                                    Ngày đặt: {formatDate(item.NGAY_LAP)}</Text>
                                <ChiTietChiTietHD MA_HD={item.MA_HD} />
                                <Text style={{ top: 5, left: 180, right: 5, fontSize: 18 }}>
                                    <Icon name="dollar-sign" style={styles.ic10} onPress={() => navigation.goBack()} />
                                    Thành tiền: <Text style={{ color: 'red' }}>{parseFloat(item.THANH_TIEN).toLocaleString('vi-VN')}đ</Text></Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.MA_HD.toString()}
                />
            )} */}
        </View>
    );
};

const styles = StyleSheet.create({
    header:{
        backgroundColor:'white',
        height:65,
    },

    container:{
        backgroundColor:'#D9D9D9',
        height:680,
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

    ic10:{
        fontSize:19,
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
        color: 'black',
        top: 50,
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

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    item: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor:'white',
        padding: 10,
        marginBottom: 10,
    },
    chiTietHDContainer: {
        marginTop: 15,
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
        padding:10,
    },

    filterContainer: {
        flexDirection: 'row',
        marginTop: 4,
        marginBottom: 5,
        paddingHorizontal: 10,
    },
    filterButton: {
        top:3,
        backgroundColor: '#DDDDDD',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginRight: 10,
    },
    selectedFilterButton: {
        // backgroundColor: '#DC2F2F',
        paddingVertical: 10,
        paddingHorizontal: 20,
        // borderRadius: 10,
        marginRight: 10,
        borderWidth: 3,
        // borderBottomWidth: 3, // Thêm border dưới
        borderColor: '#DC2F2F', // Màu của border dưới

    },
    filterText: {
        color: 'black',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default Donhang;
