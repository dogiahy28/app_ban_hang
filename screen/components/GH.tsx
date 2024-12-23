import React, { useState, useEffect } from "react";
// cần import React khi khai báo component
import { Text, View, Image, StyleSheet, TextInput, Button, TouchableOpacity, Alert} from "react-native";
// inport Text component core có sẵn ở thư viện để hiển thị text
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NavigationContainer } from '@react-navigation/native';
import Footer from './Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    navigation: any;
    };

const CaNhan = (props: Props) =>{
    const { navigation } = props;
    const [TEN_DN_KH, setTEN_DN_KH] = useState('');
    const [MAT_KHAU_KH, setMAT_KHAU_KH] = useState('');

        const handleLogout = async () => {
            Alert.alert(
            'Xác nhận đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                {
                text: 'Hủy',
                onPress: () => console.log('Hủy đăng xuất'),
                style: 'cancel',
                },
                {
                text: 'Đồng ý',
                onPress: async () => {
                    // Reset các trạng thái và dữ liệu liên quan đến việc đăng nhập
                    setTEN_DN_KH('');
                    setMAT_KHAU_KH('');
        
                    // Xóa dữ liệu 'TEN_DN_KH' từ AsyncStorage
                    try {
                    await AsyncStorage.removeItem('TEN_DN_KH');
                    } catch (error) {
                    console.log(error);
                    }
        
                    // Thực hiện các hành động cần thiết để đăng xuất, ví dụ: chuyển hướng đến màn hình đăng nhập
                    navigation.navigate('DangNhap');
                },
                },
            ],
            );
        };

        //Lấy giá trị biến TEN_DN_KH
        useEffect(() => {
            const getTEN_DN_KH = async () => {
            try {
                const TEN_DN_KH_value = await AsyncStorage.getItem('TEN_DN_KH');
                if (TEN_DN_KH_value !== null) {
                setTEN_DN_KH(TEN_DN_KH_value);
                }
            } catch (error) {
                console.log(error);
            }
            };
            getTEN_DN_KH();
        }, []);

    return (
        <View>
            <View style={styles.header}>
                <View style={styles.circle}>

                </View>
                <View style={styles.group}>
                <Text style={{fontSize:19,fontWeight:'bold',color:'black'}}>{TEN_DN_KH}</Text>
                </View>
                <Icon name="gear" style={styles.ic2} onPress={() => navigation.navigate('CaNhan')}/>
            </View>
            <View style={styles.container}>
                <Icon name="box" style={styles.ic1} onPress={() => navigation.navigate('CaNhan')}/>
                <Text style={{fontSize:20,left:55,top:11,color:'black'}}>Đơn mua</Text>
                <Icon name="chevron-right" style={styles.ic3} onPress={() => navigation.navigate('CaNhan')}/>
            </View>
            <View style={styles.container2}>
                <Icon name="location-dot" style={styles.ic1} onPress={() => navigation.navigate('CaNhan')}/>
                <Text style={{fontSize:20,left:55,top:11,color:'black'}}>Địa chỉ</Text>
                <Icon name="chevron-right" style={styles.ic3} onPress={() => navigation.navigate('CaNhan')}/>
            </View>
            <View style={styles.container}>
                <Icon name="address-book" style={styles.ic1} onPress={() => navigation.navigate('CaNhan')}/>
                <Text style={{fontSize:20,left:55,top:11,color:'black'}}>Thông tin</Text>
                <Icon name="chevron-right" style={styles.ic3} onPress={() => navigation.navigate('CaNhan')}/>
            </View>
            <View style={styles.container2}>
                <Icon name="arrow-right-arrow-left" style={styles.ic1} onPress={() => navigation.navigate('CaNhan')}/>
                <Text style={{fontSize:20,left:55,top:11,color:'black'}}>Đổi mật khẩu</Text>
                <Icon name="chevron-right" style={styles.ic3} onPress={() => navigation.navigate('CaNhan')}/>
            </View>
            <View style={styles.container3}>
                <TouchableOpacity style={styles.btn2} onPress={handleLogout}>
                        <Text style={{textAlign:'center',top:12,fontWeight:'bold', fontSize:18, color:'#DC2F2F'}}>
                            Đăng xuất</Text>
                    </TouchableOpacity>
            </View>
            <View style={styles.footer}>
                <View style={styles.foot1}>
                    <Icon name="house-chimney" style={{fontSize:24,color:'black',left:24}} 
                            onPress={() => navigation.navigate('TrangChu')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Trang chủ</Text>
                </View>
                <View style={styles.foot2}>
                    <Icon name="thumbs-up" style={{fontSize:24,color:'black',left:18}} 
                            onPress={() => navigation.navigate('DangKy')}/>
                    <Text style={{fontSize:17,fontWeight:'bold',left:8}}>Gợi ý</Text>
                </View>
                <View style={styles.foot3}>
                    <Icon name="envelope" style={{fontSize:24,color:'black',left:21}} 
                            onPress={() => navigation.navigate('DangNhap')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Tin nhắn</Text>
                </View>
                <View style={styles.foot4}>
                    <Icon name="bell" style={{fontSize:24,color:'black',left:28}} 
                            onPress={() => navigation.navigate('TrangChu')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Thông báo</Text>
                </View>
                <View style={styles.foot5}>
                    <Icon name="id-card" style={{fontSize:30,color:'black',left:24}} 
                            onPress={() => navigation.navigate('CaNhan')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Tài khoản</Text>
                </View>
            </View>
            {/* <Footer /> */}
        </View>
    );
}

const styles = StyleSheet.create({
    header:{
        backgroundColor:'#D9D9D9',
        height:120,
    },

    container:{
        backgroundColor:'white',
        height:50,
    },

    container2:{
        backgroundColor:'#D9D9D9',
        height:50,
    },

    container3:{
        backgroundColor:'white',
        height:300,
    },

    footer:{
        backgroundColor:'#DC2F2F',
        height:'100%',
    },

    group:{
        top:50,
        left:120,
        zIndex:10,
        height:45,
        width:250,
    },

    ip:{
        // borderWidth:0.5,
        backgroundColor:'white',
        borderRadius:5,
        paddingLeft:40,
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
        borderColor:'#DC2F2F',
        borderWidth:0.8,
        backgroundColor:'#D9D9D9',
        alignItems:'center',
        paddingLeft:20,
        paddingRight:20,
        height:50,
        width:200,
        position:'absolute',
        zIndex:1000,
        marginTop:230,
        marginLeft:100,
        // textAlign:`center`,
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
        fontSize:28,
        color:'#DC2F2F',
        position:'absolute',
        zIndex:10000000,
        top:10,
        left:20,
    },

    ic2:{
        fontSize:30,
        color:'#DC2F2F',
        position:'absolute',
        zIndex:10000000,
        top:43,
        right:20,
    },

    ic3:{
        fontSize:24,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:12,
        right:20,
    },

    foot1:{
        left:5,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot2:{
        left:95,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot3:{
        left:166,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot4:{
        left:242,
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

    circle: {
        width: 100,
        height: 100,
        borderRadius: 100,
        backgroundColor: 'white',
        margin:10,
        position:'absolute',
      },
})
export default CaNhan;
// export default để có thể sử dụng component Hello của bạn
