import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Alert} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import anh_sp from './Hinhanh';

type Props = {
    navigation: any;
    route: any;
};

const GioHang = (props: Props) => {
    const { navigation } = props;
    const [cart, setCart] = useState<any[]>([]);
    const [isEmptyCart, setIsEmptyCart] = useState<boolean>(true);
    const [productQuantity, setProductQuantity] = useState<{ [key: string]: number }>({});
    const [totalPayment, setTotalPayment] = useState<string>("0đ");
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [MA_CCCD, setMA_CCCD] = useState('');

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
        const getMA_CCCD = async () => {
            try {
                const MA_CCCD_value = await AsyncStorage.getItem('MA_CCCD');
                if (MA_CCCD_value !== null) {
                    setMA_CCCD(MA_CCCD_value);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getMA_CCCD();
    }, []);

    useEffect(() => {
        loadCartFromStorage();
    }, []);

    const loadCartFromStorage = async () => {
        try {
            const cartData = await AsyncStorage.getItem('cart');
            if (cartData !== null) {
                const parsedCart = JSON.parse(cartData);
                // Tạo một đối tượng để lưu trữ các sản phẩm duy nhất và số lượng của mỗi sản phẩm
                const uniqueProducts: { [key: string]: any } = {};
                parsedCart.forEach((item: any) => {
                    if (uniqueProducts[item.MA_SP]) {
                        // Nếu sản phẩm đã tồn tại trong uniqueProducts, cộng dồn số lượng
                        uniqueProducts[item.MA_SP].quantity += 1;
                    } else {
                        // Nếu sản phẩm chưa tồn tại trong uniqueProducts, thêm mới vào đối tượng
                        uniqueProducts[item.MA_SP] = { ...item, quantity: 1 };
                    }
                });
                // Chuyển đổi uniqueProducts thành mảng để hiển thị trong FlatList
                const uniqueProductsArray = Object.values(uniqueProducts);
                setCart(uniqueProductsArray);
                setIsEmptyCart(uniqueProductsArray.length === 0);
                // Lưu số lượng của từng sản phẩm vào state
                const quantityMap = uniqueProductsArray.reduce((acc: { [key: string]: number }, item: any) => {
                    acc[item.MA_SP] = item.quantity;
                    return acc;
                }, {});
                setProductQuantity(quantityMap);
            }
        } catch (error) {
            console.error('Error loading cart from AsyncStorage:', error);
        }
    };

    const removeFromCart = (product: any) => {
        const updatedCart = cart.filter((item) => item.MA_SP !== product.MA_SP);
        setCart(updatedCart);
        saveCartToStorage(updatedCart);
    };

    const saveCartToStorage = async (cartItems: any[]) => {
        try {
            await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to AsyncStorage:', error);
        }
    };

    const renderProductImage = (item: any) => {
        const index = item.MA_SP - 1;
        const imageSource = anh_sp[index % anh_sp.length].source;
        const imageId = anh_sp[index % anh_sp.length].id;

        return (
            <Image key={imageId} source={imageSource} style={{ width:150, height: 150 }} />
        );
    };

    const toggleProductSelection = (item: any) => {
        const updatedCart = cart.map(cartItem => {
            if (cartItem.MA_SP === item.MA_SP) {
                return {...cartItem, selected: !cartItem.selected};
            }
            return cartItem;
        });
        setCart(updatedCart);
    };

    const renderCartItem = ({ item }: { item: any }) => (
        <ScrollView>
        <View style={styles.cartItem}>
            <TouchableOpacity onPress={() => toggleProductSelection(item)}>
                {item.selected ? (
                    <Icon name="check-square" style={styles.selectButton} />
                ) : (
                    <Icon name="square" style={styles.selectButton} />
                )}
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>(navigation.navigate('ChiTiet',{item}))}>
                {renderProductImage(item)}
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
                <Text style={styles.productName}>{item.TEN_SP}</Text>
                <Text style={{fontWeight:'bold', fontSize:15, top:10}}>{parseFloat(item.GIA_BAN).toLocaleString('vi-VN')}đ</Text>
                <View>
                    <Text style={{fontSize:16, top:20,marginRight:10 }}>Số lượng: </Text>
                    <View>
                    <Icon name="square-minus" style={{fontSize:25,position:'absolute', left:72}} onPress={() => {
                                if (productQuantity[item.MA_SP] > 1) {
                                    const newQuantity = productQuantity[item.MA_SP] - 1;
                                    const newProductQuantity = {...productQuantity, [item.MA_SP]: newQuantity};
                                    setProductQuantity(newProductQuantity);
                                    updateCartItemQuantity(item.MA_SP, newQuantity);
                                }
                            }}/>
                        <Text
                            style={{fontWeight:'bold',fontSize:17,position:'absolute',left:97}}
                            onPress={() => {
                                const newQuantity = productQuantity[item.MA_SP] + 1;
                                const newProductQuantity = {...productQuantity, [item.MA_SP]: newQuantity};
                                setProductQuantity(newProductQuantity);
                                updateCartItemQuantity(item.MA_SP, newQuantity);
                            }}
                        >
                            {productQuantity[item.MA_SP]}
                        </Text>
                        <Icon name="square-plus" style={{fontSize:25,position:'absolute', left:112}} onPress={() => {
                            const newQuantity = productQuantity[item.MA_SP] + 1;
                            if (newQuantity <= 5) { // Kiểm tra nếu số lượng mới không vượt quá 9
                                const newProductQuantity = {...productQuantity, [item.MA_SP]: newQuantity};
                                setProductQuantity(newProductQuantity);
                                updateCartItemQuantity(item.MA_SP, newQuantity);
                            }
                        }}/>
                    </View>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item)}>
                    <Icon name="delete-left" style={styles.ic4}/>
                </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
    );
    

    const updateCartItemQuantity = (productId: string, quantity: number) => {
        const updatedCart = cart.map(item => {
            if (item.MA_SP === productId) {
                return {...item, quantity};
            }
            return item;
        });
        setCart(updatedCart);
        saveCartToStorage(updatedCart);
    
        // Tính toán lại tổng thanh toán khi cập nhật số lượng sản phẩm
        const newTotalPayment = calculateTotalPayment(updatedCart);
        setTotalPayment(newTotalPayment);
    };
    

    const calculateTotalPayment = (cartItems: any[]) => {
        let totalPayment = 0;
        for (const item of cartItems) {
            if (item.selected) {
                totalPayment += parseFloat(item.GIA_BAN) * productQuantity[item.MA_SP];
            }
        }
        return totalPayment.toLocaleString('vi-VN');
    };

    // const placeOrder = () => {
    //     const selectedProducts = cart.filter(item => item.selected);
    //     if (selectedProducts.length > 0) {
    //         // Thực hiện các hành động liên quan đến việc đặt hàng, ví dụ chuyển hướng đến màn hình thanh toán
    //         navigation.navigate('ThanhToan', { selectedProducts });
    //     } else {
    //         Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.');
    //     }
    // };

    // Function to select all products in the cart
    const selectAllProducts = () => {
        const updatedCart = cart.map(cartItem => {
            return { ...cartItem, selected: !selectAll };
        });
        setCart(updatedCart);
        setSelectAll(!selectAll);
    };

    // Function to delete all products in the cart
    const deleteAllProducts = () => {
        if (cart.length > 0) {
            Alert.alert(
                'Xác nhận',
                'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?',
                [
                    {
                        text: 'Hủy',
                        style: 'cancel'
                    },
                    {
                        text: 'Xóa',
                        onPress: () => {
                            // Clear the cart by setting it to an empty array
                            setCart([]);
                            // Clear product quantity state
                            setProductQuantity({});
                            // Clear total payment
                            setTotalPayment("0đ");
                            // Save empty cart to AsyncStorage
                            saveCartToStorage([]);
                        }
                    }
                ]
            );
        } else {
            Alert.alert('Thông báo', 'Không có sản phẩm trong giỏ hàng!');
        }
    };

    const placeOrder = () => {
        const selectedProducts = cart.filter(item => item.selected);
        if (selectedProducts.length > 0) {
            // Thực hiện các hành động liên quan đến việc đặt hàng, ví dụ chuyển hướng đến màn hình thanh toán
            navigation.navigate('Thanhtoan', { selectedProducts });
        } else {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng.');
        }
    };

    return (
        <View>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic1} onPress={() => navigation.goBack()} />
                <View style={styles.group}>
                    <Text style={{ color: 'black', fontSize: 22, top: 6, fontWeight: 'bold' }}>
                        Giỏ hàng của tôi <Text style={{ color: 'black', fontSize: 22, top: 6, fontWeight: 'normal' }}>({cartItemCount})</Text></Text>
                </View>
                {/* <Text>MA_CCCD: {MA_CCCD}</Text> */}
                <Text style={{fontSize:16,
                    color: 'black',
                    zIndex:10000001,
                    position:'absolute',
                    top:26,
                    right:68,}}
                >Chọn hết: </Text>
                <Icon name={selectAll ? "check-square" : "square"} style={styles.selectAllButton} onPress={selectAllProducts}/>
                <Icon name="trash" style={styles.deleteAllButton} onPress={deleteAllProducts}/>
                {/* <Icon name="comment-dots" style={styles.ic2} onPress={() => navigation.navigate('GioHang')} /> */}
            </View>
            <View style={styles.container}>
            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Chưa có sản phẩm trong giỏ hàng</Text>
                        <TouchableOpacity style={styles.btn3} onPress={() => navigation.navigate('TrangChu')}>
                        <Text style={{ textAlign: 'center', top: 12, fontWeight: 'bold', fontSize: 18, color: 'black' }}>
                            Thêm ngay
                        </Text>
                    </TouchableOpacity>
                    </View>
                )}
            />

            </View>
            <View style={styles.footer}>
                <Text style={{ color: 'black', fontSize: 14, fontWeight: 'bold', top: 18, left: 20 }}>
                    Tổng thanh toán: <Text style={{color: 'black', fontSize: 16, fontWeight: 'bold'}}>{calculateTotalPayment(cart)}đ</Text>
                </Text>
                <View style={styles.foot3}>
                <TouchableOpacity style={styles.btn2} onPress={placeOrder}>
                    <Text style={{ textAlign: 'center', top: 12, fontWeight: 'bold', fontSize: 18, color: 'white' }}>
                        Mua hàng
                    </Text>
                </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header:{
        backgroundColor:'white',
        height:72,
    },

    container:{
        backgroundColor:'#fe877c',
        height:547,
    },

    footer:{
        backgroundColor:'#D9D9D9',
        height:70,
        // marginBottom:1,
    },

    group:{
        marginTop:15,
        marginLeft:50,
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
        top:22,
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
        padding: 10,
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
        width: 210,
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

export default GioHang;
