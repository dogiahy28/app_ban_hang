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

const GoiY = (props: Props) => {
    const { navigation } = props;
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [bannerIndex, setBannerIndex] = useState(0);
    const [keyword, setKeyword] = useState('');
    const bannerRef = useRef<ScrollView>(null);
    const [cartItemCount, setCartItemCount] = useState(0); // State to hold cart item count
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    interface AppNotification {
        id: string;
        message: string;
        read: boolean;
    }

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
            setProducts(response.data);
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

    // const navigateToChiTiet = (MA_SP: string) => {
    //     navigation.navigate('ChiTiet', { MA_SP: MA_SP });
    // };

    const renderProductImage = (item: any) => {
        const index = item.MA_SP-1;
        const imageSource = anh_sp[index % anh_sp.length].source;
        const imageId = anh_sp[index % anh_sp.length].id;

        return (
            <Image key={imageId} source={imageSource} style={{ width: 185, height: 180 }} />
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
                {/* <View>
                    <ScrollView
                        ref={bannerRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleBannerChange}
                        scrollEventThrottle={16}
                        style={{height:250}}
                    >
                        {banners.map((banner, index) => (
                            <Image key={index} source={banner} style={styles.bannerImage} />
                        ))}
                    </ScrollView>
                </View> */}
                <View style={{height:30,justifyContent: 'center',margin:7}}>
                    <Text style={{fontSize:20,color:'#DC2F2F',fontWeight:'bold'}}>
                        SẢN PHẨM BÁN CHẠY!!! <Icon name="fire" style={styles.ic1} /></Text>
                </View>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <FlatList
                        data={products}
                        keyExtractor={(item) => item.MA_SP.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.productContainer} >
                            <TouchableOpacity onPress={() => {
                                if (item.SO_LUONG > 0) {
                                    navigation.navigate('ChiTiet', { item });
                                } else {
                                    navigation.navigate('ChiTiet', { item });
                                    // Xử lý khi sản phẩm hết hàng, có thể thông báo cho người dùng
                                    // console.log('Sản phẩm này đã hết hàng!');
                                }
                            }}>
                                {renderProductImage(item)}
                            </TouchableOpacity>
                            <Text style={{ top: 2, fontSize: 16, textAlign: 'center' }}>
                                {item.TEN_SP}
                            </Text>
                            <Text style={{ marginTop: 10, marginBottom: 10, color: item.SO_LUONG < 1 ? 'red' : '#DC2F2F', fontSize: 18, textAlign: 'left' }}>
                                {item.SO_LUONG < 1 ? 'HẾT HÀNG!' : parseFloat(item.GIA_BAN).toLocaleString('vi-VN') + 'đ'}
                            </Text>
                            {/* <Text style={{ marginTop: 10, marginBottom: 10, color: 'black', fontSize: 18, textAlign: 'left' }}>
                                {item.SO_LUONG < 1 ? '' : `Đã bán: ${100 - item.SO_LUONG}`}
                            </Text> */}
                            <View style={{ marginTop: 10, marginBottom: 10 }}>
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
                        )}
                        numColumns={2}
                    />
                )}
            </ScrollView>
            <View style={styles.footer}>
                <View style={styles.foot1}>
                    <Icon name="house-chimney" style={{fontSize:24,color:'black',left:24}}
                            onPress={() => navigation.navigate('TrangChu')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Trang chủ</Text>
                </View>
                <View style={styles.foot2}>
                    <Icon name="thumbs-up" style={{fontSize:30,color:'black',left:20}}
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
                    <Icon name="gift" style={{fontSize:24,color:'black',left:14}}
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
        top:7,
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
        top:12,
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

    productContainer: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        margin: 5,
        borderColor: 'black',
        backgroundColor: '#f2f1ed',
        borderRadius: 5,
        padding: 5,
        textAlign:'left',
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

});

export default GoiY;
