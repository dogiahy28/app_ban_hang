import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, Alert, ScrollView, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import anh_sp from './Hinhanh';
import { RouteProp} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    route: any;
    navigation: any;
};

const ChiTiet = (props: Props) => {
    const { route } = props;
    const { MA_SP } = route.params;
    const { navigation } = props; // Use the useNavigation hook to access the navigation object
    const [productDetail, setProductDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { item } = route.params;
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [cart, setCart] = useState<any[]>([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
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

    useEffect(() => {
        // Load cart items from AsyncStorage when component mounts
        loadCartFromStorage();
    }, []);

    // Function to load cart items from AsyncStorage
    const loadCartFromStorage = async () => {
        try {
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData !== null) {
                const parsedCart = JSON.parse(cartData);
                setCart(parsedCart);
                setCartItemCount(parsedCart.length);
            }
        } catch (error) {
            console.error('Error loading cart from AsyncStorage:', error);
        }
    };

    // Function to save cart items to AsyncStorage
    const saveCartToStorage = async (cartItems: any[]) => {
        try {
            await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to AsyncStorage:', error);
        }
    };

    // Function to add product to cart
    const addToCart = (product: any, quantity: number) => {
        const productWithQuantity = { ...product, quantity: quantity };
        const updatedCart = [...cart, productWithQuantity];
        setCart(updatedCart);
        setCartItemCount(updatedCart.length);
        saveCartToStorage(updatedCart);
        setIsButtonPressed(true); // Kích hoạt hiệu ứng
        setTimeout(() => {
            setIsButtonPressed(false); // Tắt hiệu ứng sau một khoảng thời gian ngắn
        }, 1000);
    };

    const renderProductImage = (item: any) => {
        const index = item.MA_SP - 1;
        const imageSource = anh_sp[index % anh_sp.length].source;
        const imageId = anh_sp[index % anh_sp.length].id;

        return (
            <Image key={imageId} source={imageSource} style={{ width:'auto', height: 320 }} />
        );
    };

    const toggleSearchBar = () => {
        setShowSearchBar(!showSearchBar);
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
            setProductDetail(response.data); // Assuming response.data contains the search results
        } catch (error) {
            console.error('Error searching for products:', error);
        }
        navigation.navigate('TimKiem', { keyword });
    };

    // Hàm render hiệu ứng khi bấm vào icon tìm kiếm
    const renderSearchBar = () => {
        if (showSearchBar) {
            return (
                <View style={styles.group}>
                    <TextInput
                        style={styles.ip}
                        placeholder="Tìm sản phẩm..."
                        value={keyword}
                        onChangeText={setKeyword} // Update keyword state as user types
                    />
                    <TouchableOpacity style={styles.btn} onPress={handleSearch}>
                        <Text style={{ textAlign: 'center', top: 6, fontWeight: 'bold', fontSize: 16, color: 'black' }}>Tìm</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    // Tính giảm giá
    const discountPercentage = ((item.GIA_GOC - item.GIA_BAN) / item.GIA_GOC) * 100;

    const handleBuyNow = (product: any) => {
        // Lưu thông tin sản phẩm được chọn vào state và mở modal
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const handleConfirmBuy = () => {
        if (selectedProduct) {
            // Thêm sản phẩm được chọn vào giỏ hàng với số lượng được chọn
            addToCart(selectedProduct, quantity);
            // Chuyển đến trang thanh toán và chuyển dữ liệu cần thiết qua props route
            navigation.navigate('Thanhtoan', { selectedProducts: [{ ...selectedProduct, quantity }] });
            // Đóng modal
            setModalVisible(false);
        }
    };

    // Function to decrease quantity
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // Function to increase quantity
    const increaseQuantity = () => {
        if (quantity < 5) {
            setQuantity(quantity + 1);
        }
    };

    const handleSetQuantity = (value: number) => {
        if (value <= 5) {
            setQuantity(value);
        } else {
            setQuantity(5);
            // Alert.alert(
            //     'Thông báo',
            //     'Số lượng sản phẩm không được vượt quá 5!',
            // );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic1} onPress={() => navigation.goBack()} />
                {/* <Icon name="magnifying-glass" style={styles.ic} onPress={toggleSearchBar}/> */}
                {/* Hiển thị TextInput khi bấm vào icon tìm kiếm */}
                <View style={styles.iconWrapper} >
                    <Icon style={{fontSize:24,}} name="magnifying-glass" onPress={toggleSearchBar}/>
                </View>
                {renderSearchBar()}
                <Icon name="bell" style={styles.ic3} onPress={() => navigation.navigate('Thongbao')}/>
                    {unreadNotifications > 0 &&
                    <Text style={styles.notificationCount}>{unreadNotifications}</Text>}
                <Icon name="cart-shopping" style={styles.ic2} onPress={() => navigation.navigate('GioHang')}/>
                    {cartItemCount > 0 &&
                    <Text style={styles.cartItemCount}>{cartItemCount}</Text>}
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
            <View>
                {renderProductImage(item)}
                <View style={{backgroundColor:'#DC2F2F',height:100}}>
                    <Text style={{fontSize:19, color:'yellow',top:7,left:15,fontWeight:'bold'}}>GIÁ ĐẶC BIỆT</Text>
                    <Text style={{fontSize:26,fontWeight:'bold',color:'white',top:10,left:15}}>
                        {parseFloat(item.GIA_BAN).toLocaleString('vi-VN')}đ</Text>
                        <Text style={{ fontSize: 15, color: 'white', top: 12, left: 15 }}>
                            <Text style={{ textDecorationLine: 'line-through' }}>{parseFloat(item.GIA_GOC).toLocaleString('vi-VN')}đ</Text>
                            {'   -'}{discountPercentage.toFixed(0)}%
                        </Text>
                    {/* <Text>SIÊU SALE!!!</Text> */}
                    <Image style={{left:180,position:'absolute'}} source={require('../../assets/image/salee.png')}></Image>
            </View>
                <Text style={{fontSize:24,color:'black',fontWeight:'bold',top:2,margin:5}}>{item.TEN_SP}</Text>
                <Text style={{top:2,margin:5}}>
                    Thương hiệu: <Text style={{fontSize:17,color:'black',fontWeight:'bold' }}>{item.TEN_NCC}</Text>
                </Text>
                <Text style={{fontSize:16,color:'black',top:2,margin:5}}>{item.MO_TA_SP}</Text>
            </View>
            </ScrollView>
            <View style={styles.footer}>
                <View style={styles.foot1}>
                    <Icon name="message" style={{fontSize:24,color:'black',left:24}}/>
                    <Text style={{fontSize:17,fontWeight:'bold',color:'black'}}>Chat ngay</Text>
                </View>
                {item.SO_LUONG < 1 ? (
                    <Text style={{fontSize:24,top:15,left:100,color:'#DC2F2F',fontWeight:'bold'}}>
                        {/* <Icon name="house-circle-exclamation" style={{fontSize:30,color:'#DC2F2F'}}/>   */}
                            Sản phẩm đã HẾT HÀNG!!!</Text>
                ) : (
                    <>
                    <View style={styles.foot2}>
                        <TouchableOpacity
                            style={[styles.btn1, isButtonPressed && { backgroundColor: '#DC2F2F' }]}
                            onPress={() => addToCart(item, 1)}
                            disabled={isButtonPressed}
                        >
                            <Text style={{ textAlign: 'center', top: 2, fontWeight: 'bold', fontSize: 18, color: isButtonPressed ? 'black' : '#DC2F2F' }}>
                                {isButtonPressed ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.foot3}>
                        <TouchableOpacity style={styles.btn2} onPress={() => handleBuyNow(item)}>
                            <Text style={{ textAlign: 'center', top: 12, fontWeight: 'bold', fontSize: 18, color: 'white' }}>
                                Mua ngay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
            </View>
            {/* Modal hoặc trang chọn số lượng sản phẩm */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                            <Icon style={styles.closeIcon} name="rectangle-xmark" color="#000" onPress={() => setModalVisible(false)}/>
                        <Text style={{fontSize:19,color:'black'}}>Chọn số lượng sản phẩm</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={decreaseQuantity}>
                                <Icon name="square-minus" size={37} />
                            </TouchableOpacity>

                            <TextInput
                                style={styles.quantityInput}
                                value={quantity.toString()}
                                onChangeText={(text) => handleSetQuantity(parseInt(text) || 0)} // Thay đổi đây
                                keyboardType="numeric"
                            />

                            <TouchableOpacity onPress={increaseQuantity}>
                                <Icon name="square-plus" size={37} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={handleConfirmBuy} style={styles.confirmButton}>
                            <Text style={styles.confirmButtonText}>Xác nhận mua</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    header:{
        height:72,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },

    content: {
        flex: 1,
        marginTop: 72, // Adjust based on header height
        alignItems: 'center',
        justifyContent: 'center',
    },

    group:{
        marginTop:3,
        marginLeft:48,
        marginRight:30,
        zIndex:10,
        height:45,
        width:250,
    },

    footer:{
        backgroundColor:'#D9D9D9',
        height:65,
    },

    ip:{
        // borderWidth:0.5,
        backgroundColor:'#ebedf0',
        borderRadius:5,
        paddingLeft:40,
    },

    btn:{
        backgroundColor:'#DC2F2F',
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

    ic:{
        fontSize:26,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:24,
        left:55,
    },

    iconWrapper: {
        position: 'absolute',
        zIndex: 10000000,
        top: 16,
        left: 55,
        width: 40, // Chiều rộng của vùng bao quanh icon
        height: 40, // Chiều cao của vùng bao quanh icon
        borderRadius: 20, // Bán kính là nửa của chiều rộng (hoặc chiều cao) để tạo thành hình tròn
        backgroundColor: '#e0e0e0', // Màu nền của vùng bao quanh icon, ở đây là trong suốt
        alignItems: 'center',
        justifyContent: 'center',
    },

    ic1:{
        fontSize:28,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:22,
        left:12,
    },

    ic2:{
        fontSize:26,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:26,
        right:20,
    },

    ic3:{
        fontSize:26,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:25,
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

    cartItemCount: {
        position: 'absolute',
        zIndex: 10000001,
        top: 15,
        right: 14,
        backgroundColor: '#DC2F2F',
        color: 'white',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        fontSize: 14,
    },

    modalContainer: {
        // top:450,
        flex: 1,
        // justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        top:380,
        backgroundColor: 'white',
        width: '100%',
        height: 220,
        padding: 20,
        borderRadius: 10,
    },
    quantityControl: {
        top:20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    quantityInput: {
        fontSize: 20,
        padding:1,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginHorizontal: 10,
        width: 40,
        height: 40,
        textAlign: 'center',
    },
    confirmButton: {
        top:40,
        height:50,
        backgroundColor: '#DC2F2F',
        padding: 10,
        borderRadius: 5,
    },
    confirmButtonText: {
        fontSize:20,
        color: 'white',
        textAlign: 'center',
    },

    closeIcon: {
        fontSize:36,
        color:'#DC2F2F',
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1,
    },

    notificationCount: {
        position: 'absolute',
        zIndex: 10000001,
        top:14,
        right: 60,
        backgroundColor: '#DC2F2F',
        color: 'white',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        fontSize: 14,
    },
})

export default ChiTiet;
