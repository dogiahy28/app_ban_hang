import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import anh_sp from './Hinhanh';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    navigation: any;
};

const UuDai = (props: Props) => {
    const { navigation } = props;
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [bannerIndex, setBannerIndex] = useState(0);
    const [keyword, setKeyword] = useState('');
    const bannerRef = useRef<ScrollView>(null);
    const [cartItemCount, setCartItemCount] = useState(0); // State to hold cart item count
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        // Gọi hàm để lấy số lượng thông báo chưa đọc khi component mount
        getUnreadNotificationsCount();
    }, []);

    // Hàm để lấy số lượng thông báo chưa đọc từ AsyncStorage
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

    // Function to get cart item count from AsyncStorage
    const getCartItemCount = async () => {
        try {
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData !== null) {
                const parsedCart = JSON.parse(cartData);
                setCartItemCount(parsedCart.length);
            } else {
                setCartItemCount(0);
            }
        } catch (error) {
            console.error('Error getting cart item count from AsyncStorage:', error);
        }
    };

    useEffect(() => {
        // Load cart item count from AsyncStorage when component mounts
        getCartItemCount();
    }, []);

    useEffect(() => {
        // Subscribe to navigation focus event to update cart item count when screen comes into focus
        const unsubscribe = navigation.addListener('focus', () => {
            getCartItemCount();
        });

        return unsubscribe;
    }, [navigation]);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://192.168.56.1:3000/suggest');
            // Lọc các sản phẩm có GIA_BAN thấp hơn GIA_GOC trên 30%
            const filteredProducts = response.data.filter((product: any) => {
                const giaBan = parseFloat(product.GIA_BAN);
                const giaGoc = parseFloat(product.GIA_GOC);
                return giaBan < giaGoc * 0.7; // 30% discount
            });
            setProducts(filteredProducts);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (bannerRef.current) {
                let nextIndex = (bannerIndex + 1) % banners.length;
                bannerRef.current.scrollTo({ x: nextIndex * 412, animated: true });
                setBannerIndex(nextIndex);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [bannerIndex]);

    useFocusEffect(
        React.useCallback(() => {
            fetchData();
        }, [])
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            setKeyword(''); // Reset the keyword when the screen comes into focus
        });

        return unsubscribe;
    }, [navigation]);

    const banners = [
        require('../../assets/image/banner1.1.jpg'),
        require('../../assets/image/banner1.2.jpg'),
        require('../../assets/image/banner-3.jpg'),
    ];

    const handleBannerChange = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const currentIndex = Math.round(contentOffsetX / 412);
        setBannerIndex(currentIndex);
    };

    const handleSearch = async () => {
        if (keyword.trim() === '') {
            Alert.alert(
                'Thông báo',
                'Bạn chưa nhập dữ liệu vào ô tìm kiếm!',
            );
            return;
        }
        try {
            const response = await axios.post('http://192.168.56.1:3000/search', { keyword });
            setProducts(response.data);
        } catch (error) {
            console.error('Error searching for products:', error);
        }
        navigation.navigate('TimKiem', { keyword });
    };

    // Tính % giảm giá
    const calculateDiscountPercent = (giaBan: number, giaGoc: number) => {
        return Math.round(((giaGoc - giaBan) / giaGoc) * 100);
    };

    const renderProductImage = (item: any) => {
        const index = item.MA_SP-1;
        const imageSource = anh_sp[index % anh_sp.length].source;
        const imageId = anh_sp[index % anh_sp.length].id;

        return (
            <Image key={imageId} source={imageSource} style={{ width: 185, height: 180 }} />
        );
    };

    const renderProduct = (item: any, index: number) => {
        const discountPercent = calculateDiscountPercent(parseFloat(item.GIA_BAN), parseFloat(item.GIA_GOC));
        return (
            <View key={index} style={[styles.productContainer, index % 2 === 0 ? styles.leftProduct : null]}>
                <TouchableOpacity onPress={()=>(navigation.navigate('ChiTiet',{item}))}>
                    {renderProductImage(item)}
                </TouchableOpacity>
                <Text style={{top:2, fontSize:16, textAlign: 'center'}}>
                    {item.TEN_SP}</Text>
                <Text style={{marginTop:10, marginBottom: 10, color:'#DC2F2F', fontSize:18, textAlign: 'left'}} >
                    {parseFloat(item.GIA_BAN).toLocaleString('vi-VN')}đ</Text>
                <View style={styles.discountContainer}>
                    <Text style={styles.discountText}>{discountPercent}%</Text>
                </View>
            </View>
        );
    };

    // Thêm useState cho danh sách sản phẩm FLASH SALE vào component UuDai
    const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);

    // Tạo hàm để lấy ra 5 sản phẩm ngẫu nhiên từ danh sách sản phẩm
    const fetchFlashSaleProducts = async () => {
        try {
            const response = await axios.get('http://192.168.56.1:3000/flash-sale-products'); // Thay đổi URL theo API của bạn
            const randomProducts = getRandomProducts(response.data, 5); // Lấy 5 sản phẩm ngẫu nhiên
            setFlashSaleProducts(randomProducts);
        } catch (error) {
            console.error('Error fetching flash sale products:', error);
        }
    };

    // Hàm lấy n sản phẩm ngẫu nhiên từ danh sách sản phẩm
    const getRandomProducts = (products: any[], n: number) => {
        const shuffled = products.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    // Gọi hàm fetchFlashSaleProducts trong useEffect để lấy dữ liệu khi component mount
    useEffect(() => {
        fetchFlashSaleProducts();
    }, []);

    // Định nghĩa hàm render cho sản phẩm FLASH SALE
    const renderFlashSaleProduct = (item: any, index: number) => {
        const discountPercent = calculateDiscountPercent(parseFloat(item.GIA_BAN), parseFloat(item.GIA_GOC));
        return (
            <View key={index} style={[styles.productContainer2, index % 2 === 0 ? styles.leftProduct : null]}>
                <TouchableOpacity onPress={()=>(navigation.navigate('ChiTiet',{item}))}>
                    {renderProductImage(item)}
                </TouchableOpacity>
                <Text style={{top:2, fontSize:16, textAlign: 'center'}}>
                    {item.TEN_SP}</Text>
                <Text style={{marginTop:10, marginBottom: 10, color:'#DC2F2F', fontSize:18, textAlign: 'left'}} >
                    {parseFloat(item.GIA_BAN).toLocaleString('vi-VN')}đ</Text>
                <View style={styles.discountContainer}>
                    <Text style={styles.discountText}>{discountPercent}%</Text>
                </View>
                <View style={{ marginTop: 3, marginBottom: 10 }}>
                    {item.SO_LUONG >= 1 && (
                        <View style={{ position: 'relative', height: 20 }}>
                            <View style={{ position: 'absolute', top: -2, left: 50, zIndex: 1 }}>
                                <Text style={{ color: 'black', fontSize: 16 }}>
                                    Đã bán: {100 - item.SO_LUONG}
                                </Text>
                            </View>
                            <View style={{ height: 19, backgroundColor: '#CCCCCC', borderRadius: 5 }}>
                                <View style={{ width: `${100 - item.SO_LUONG}%`, height: '100%', backgroundColor: '#DC2F2F', borderRadius: 5 }} />
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={{backgroundColor:'white', bottom:0}}>
            <View style={styles.header}>
                <View style={styles.group}>
                    <Icon name="magnifying-glass" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Tìm sản phẩm..." value={keyword}
                        onChangeText={setKeyword}/>
                    <TouchableOpacity style={styles.btn} onPress={handleSearch}>
                        <Text style={{ textAlign: 'center', top: 6, fontWeight: 'bold', fontSize: 16, color: 'black' }}>Tìm</Text>
                    </TouchableOpacity>
                </View>
                <Icon name="cart-shopping" style={styles.ic2} onPress={() => navigation.navigate('GioHang')} />
                    {cartItemCount > 0 &&
                    <Text style={styles.cartItemCount}>{cartItemCount}</Text>}
            </View>
            <ScrollView style={{top:2,marginBottom:138}} showsVerticalScrollIndicator={false}>
                <View style={{height:30,justifyContent: 'center',margin:7}}>
                    <Text style={{fontSize:20,color:'#DC2F2F',fontWeight:'bold'}}>
                        <Icon name="bolt-lightning" style={styles.ic1} /> FLASH SALE!!!</Text>
                </View>
                {/* <FlatList
                    data={flashSaleProducts}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => navigation.navigate('ChiTiet', { item })}>
                            <View style={[styles.productContainer2, index === 0 ? { marginLeft: 10 } : null, index === flashSaleProducts.length - 1 ? { marginRight: 10 } : null]}>
                                {renderProductImage(item)}
                                <Text style={{ top: 2, fontSize: 16, textAlign: 'center' }}>
                                    {item.TEN_SP}
                                </Text>
                                <Text style={{ marginTop: 10, marginBottom: 10, color: '#DC2F2F', fontSize: 18, textAlign: 'left' }}>
                                    {parseFloat(item.GIA_BAN).toLocaleString('vi-VN')}đ
                                </Text>
                                <View style={styles.discountContainer}>
                                    <Text style={styles.discountText}>{((item.GIA_GOC-item.GIA_BAN)/item.GIA_GOC)*100}%</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 10 }} // Đảm bảo padding cho việc scroll */}
                {/* /> */}
                <FlatList
                    data={flashSaleProducts}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => renderFlashSaleProduct(item, index)}
                />

                <View style={{height:30,justifyContent: 'center',margin:7}}>
                    <Text style={{fontSize:20,color:'#DC2F2F',fontWeight:'bold'}}>
                        SIÊU ƯU ĐÃI TỪ 30% - 40% <Icon name="fire-flame-curved" style={styles.ic1} /></Text>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <View style={styles.productRow}>
                        {products.map((product, index) => renderProduct(product, index))}
                    </View>
                )}
            </ScrollView>
            <View style={styles.footer}>
                <View style={styles.foot1}>
                    <Icon name="house-chimney" style={{fontSize:24,color:'black',left:24}}
                            onPress={() => navigation.navigate('TrangChu')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Trang chủ</Text>
                </View>
                <View style={styles.foot2}>
                    <Icon name="thumbs-up" style={{fontSize:24,color:'black',left:20}}
                            onPress={() => navigation.navigate('GoiY')}/>
                    <Text style={{fontSize:17,fontWeight:'bold',left:13}}>Gợi ý</Text>
                </View>
                <View style={styles.foot3}>
                    <Icon name="bell" style={{fontSize:24,color:'black',left:28}}
                            onPress={() => navigation.navigate('Thongbao', { message: 'Mua hàng thành công' })}/>
                        {unreadNotifications > 0 &&
                        <Text style={styles.notificationCount}>{unreadNotifications}</Text>}
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Thông báo</Text>
                </View>
                <View style={styles.foot4}>
                    <Icon name="gift" style={{fontSize:30,color:'black',left:11}}
                            onPress={() => navigation.navigate('UuDai')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Ưu đãi</Text>
                </View>
                <View style={styles.foot5}>
                    <Icon name="id-card" style={{fontSize:24,color:'black',left:24}}
                            onPress={() => navigation.navigate('CaNhan')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Tài khoản</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header:{
        backgroundColor:'#DC2F2F',
        height:75,
    },

    container:{
        backgroundColor:'white',
        height:545,
        marginTop: 0,
        marginBottom: 0,
    },

    footer:{
        backgroundColor:'#DC2F2F',
        height:200,
        bottom:138,
    },

    group:{
        marginTop:15,
        marginLeft:15,
        marginRight:30,
        zIndex:10,
        height:45,
        width:310,
    },

    ip:{
        backgroundColor:'white',
        borderRadius:5,
        paddingLeft:45,
    },

    btn:{
        backgroundColor:'#D9D9D9',
        marginTop:4.5,
        marginLeft:242,
        alignItems:'center',
        height:35,
        width:60,
        borderRadius:3,
        position:'absolute',
        zIndex:1000,
        textAlign:`center`,
    },

    ic:{
        fontSize:22,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:10,
        left:10,
    },

    ic1:{
        fontSize:23,
        color:'orange',
        position:'absolute',
        zIndex:10000000,
        top:10,
        left:10,
    },

    ic2:{
        fontSize:27,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:26,
        right:30,
    },

    foot1:{
        left:5,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot2:{
        left:93,
        top:11,
        fontSize:20,
        position:'absolute',
    },

    foot3:{
        left:165,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot4:{
        left:263,
        top:7,
        fontSize:20,
        position:'absolute',
    },

    foot5:{
        left:330,
        top:12,
        fontSize:20,
        position:'absolute',
    },
    bannerImage: {
        width: 412,
        height: 300,
    },

    productRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Các sản phẩm sẽ nằm bên trái
    },
    productContainer: {
        width: '49%', // Hiển thị mỗi sản phẩm trên một hàng
        padding: 5,
        textAlign:'left',
        borderColor: 'black',
        backgroundColor: '#f2f1ed',
        height:290,
        borderRadius: 5,
        margin: 2,
    },
    productContainer2: {
        width: 195, // Hiển thị mỗi sản phẩm trên một hàng
        padding: 5,
        textAlign:'left',
        borderColor: 'black',
        backgroundColor: '#f2f1ed',
        height:295,
        borderRadius: 5,
        margin: 2,
    },
    leftProduct: {
        alignSelf: 'flex-start', // Đặt sản phẩm bên trái
    },

    cartItemCount: {
        position: 'absolute',
        zIndex: 10000001,
        top: 16,
        right: 24,
        backgroundColor: 'white',
        color: 'black',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        fontSize: 12,
    },

    notificationCount: {
        position: 'absolute',
        zIndex: 10000001,
        right: 20,
        backgroundColor: 'white',
        color: 'black',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        fontSize: 14,
    },

    discountContainer: {
        position: 'absolute',
        top: 2,
        right: 5,
        backgroundColor: '#DC2F2F', // Màu nền của phần trăm giảm giá
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },

    discountText: {
        color: 'white',
        fontSize: 15,
    },

});

export default UuDai;
