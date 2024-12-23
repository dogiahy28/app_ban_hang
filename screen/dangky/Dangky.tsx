import React from "react";
import { Text, View, Image, StyleSheet, TextInput, Button, TouchableOpacity} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type Props = {
    navigation: any;
    };

const DangKy = (props: Props) =>{
    const { navigation } = props;
    return (
        <View>
            <View style={styles.container}>
                <Image source={require('../../image/logo.png')}/>
                <Text style={styles.title}>HYDANZ</Text>
            </View>
            <View>
                <Text style={styles.name}>Đăng Ký Tài Khoản</Text>
            </View>
            <View>
                <View style={styles.group}>
                    <Icon name="address-card" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Tên đăng nhập..."></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="key" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Mật khẩu..."></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="key" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Nhập lại mật khẩu..."></TextInput>
                </View>
            </View>
            <View>
                <View>
                    <TouchableOpacity style={styles.btn}>
                        <Text style={{textAlign:'center', top:7, fontWeight:'bold', fontSize:22, color:'black'}}>Đăng ký</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{textAlign:'center', fontSize:16, color:'black', top:50}}>Đã có tài khoản?</Text>
                    <Text style={{textAlign:'center', fontSize:16, color:'blue', top:60}} 
                            onPress={() => navigation.navigate('DangNhap')}>Đăng nhập ngay bây giờ</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        height: 130,
        backgroundColor:'#D9D9D9',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
    },

    title:{
        fontWeight:'bold',
        fontSize:24,
        color:'black',
    },

    name:{
        fontWeight:'bold',
        color:'#DC2F2F',
        fontSize:28,
        textAlign: 'center',
        marginTop:40,
        marginBottom:10,
    },

    form:{

    },

    group:{
        marginTop:22,
        marginLeft:30,
        marginRight:30,
        zIndex:10,
    },

    ip:{
        borderWidth:1,
        backgroundColor:'#D9D9D9',
        borderRadius:5,
        paddingLeft:45,
    },

    icon:{
        width:28,
        height:28,
        position:'absolute',
        top:9,
        left:10,
        zIndex:100,
    },

    btn:{
        backgroundColor:'#DC2F2F',
        marginTop:40,
        marginLeft:100,
        marginRight:100,
        alignItems:'center',
        height:45,
        borderRadius:3,
    },

    ic:{
        fontSize:22,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:14,
        left:10,

    }

})
export default DangKy;