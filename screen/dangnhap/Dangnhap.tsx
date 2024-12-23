import React from "react";
import { Text, View, Image, StyleSheet, TextInput, Button, TouchableOpacity} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

type Props = {
    navigation: any;
    };

const DangNhap = (props: Props) =>{
    const { navigation } = props;
    return (
        <View>
            <View style={{top:20, left:10}}>
                {/* <Image source={require('../../image/back.png')}/> */}
                <Icon name="arrow-left" size={28} color="black"  />
            </View>
            <View>
                <Text style={styles.name}>XIN CHÀO!</Text>
            </View>
            <View>
                <Text style={styles.name2}>Chào mừng bạn đã đến với
                    <Text style={styles.name3}> Hydanz</Text>
                </Text>
            </View>
            <View style={{justifyContent: 'center', alignItems: 'center',}}>
                <Image source={require('../../image/hello.png')}/>
            </View>
            <View style={styles.group}>
                    <Icon name="address-card" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Tên đăng nhập..."></TextInput>
            </View>
                <View style={styles.group}>
                <Icon name="key" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Mật khẩu..."></TextInput>
                </View>
            <View>
                <TouchableOpacity style={styles.btn}>
                    <Text style={{textAlign:'center', top:7, fontWeight:'bold', fontSize:22, color:'black'}}>Đăng nhập</Text>
                </TouchableOpacity>
            </View>
            <View>
                <Text style={{textAlign:'center', fontSize:16, color:'blue', top:10}}>Quên mật khẩu?</Text>
            </View>
            <View>
                <Text style={styles.name4}>Bạn chưa có tài khoản?
                    <Text style={styles.name5}  onPress={() => navigation.navigate('DangKy')}> Đăng ký</Text>
                </Text>
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
        color:'black',
        fontSize:28,
        textAlign: 'left',
        marginTop:40,
        marginLeft:12,
    },

    name2:{
        // fontWeight:'bold',
        color:'black',
        fontSize:22,
        textAlign:'left',
        marginLeft:12,
        marginBottom:10,
    },

    name3:{
        color:'#DC2F2F',
        fontWeight:'bold',
        fontSize:25,
    },

    name4:{
        fontSize:16,
        color:'black',
        marginTop:50,
        textAlign:'center',
    },

    name5:{
        fontSize:16,
        color:'blue',
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
        paddingLeft:40,
        fontSize:17,
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
        marginTop:35,
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
export default DangNhap;