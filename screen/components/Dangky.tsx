import React, { useState, useEffect} from 'react';
import { Text, View, Image, StyleSheet, TextInput, Button, Alert, TouchableOpacity} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from "axios";

type Props = {
    navigation: any;
    };

const DangKy = (props: Props) =>{
    const { navigation } = props;
    const [MA_CCCD, setMA_CCCD] = useState('');
    const [TEN_KH, setTEN_KH] = useState('');
    const [SDT_KH, setSDT_KH] = useState('');
    const [EMAIL_KH, setEMAIL_KH] = useState('');
    const [DIA_CHI_KH, setDIA_CHI_KH] = useState('');
    const [TEN_DN_KH, setTEN_DN_KH] = useState('');
    const [MAT_KHAU_KH, setMAT_KHAU_KH] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const dinhnghiaPost = () => {
         // Kiểm tra xem tất cả các trường đã được nhập đầy đủ thông tin chưa
        if (
            MA_CCCD === '' ||
            TEN_KH === '' ||
            SDT_KH === '' ||
            EMAIL_KH === '' ||
            DIA_CHI_KH === '' ||
            TEN_DN_KH === '' ||
            MAT_KHAU_KH === ''
        ) {
            // Hiển thị thông báo lỗi nếu có trường nào đó chưa được nhập
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        const url = "http://192.168.56.1:3000/data";
        axios.post(url, {
            MA_CCCD,
            TEN_KH,
            SDT_KH,
            EMAIL_KH,
            DIA_CHI_KH,
            TEN_DN_KH,
            MAT_KHAU_KH
        })
        .then((res) => {
            console.log(res);
            // Reset dữ liệu
            setMA_CCCD('');
            setTEN_KH('');
            setSDT_KH('');
            setEMAIL_KH('');
            setDIA_CHI_KH('');
            setTEN_DN_KH('');
            setMAT_KHAU_KH('');
            // Alert.alert("Đăng ký tài khoản thành công!");
            Alert.alert(
                'Thông báo',
                'Đăng ký tài khoản thành công! Đăng nhập ngay?',
                [
                  { text: 'Hủy', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                  { text: 'Đồng ý', onPress: () => navigation.navigate('DangNhap') },
                ],
                { cancelable: false }
              );
          })
          .catch((err) => {
            console.log(err);
            // Hiển thị thông báo lỗi nếu có
            // Alert.alert("Đăng ký không thành công!!!", "Vui lòng thử lại!");
          });
      };
    return (
        <View>
            <View style={styles.container}>
                <Image style={{height:50}} source={require('../../assets/image/logo.png')}/>
                <Text style={styles.title}>HYDANZ</Text>
            </View>
            <View>
                <Text style={styles.name}>Đăng Ký Tài Khoản</Text>
            </View>
            <View>
                <View style={styles.group}>
                    <Icon name="address-card" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Mã căn cước công dân..." keyboardType="number-pad" onChangeText={setMA_CCCD}
                        value={MA_CCCD}></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="id-card" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Họ tên..." onChangeText={setTEN_KH}
                        value={TEN_KH}></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="phone" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Số điện thoại..." keyboardType="phone-pad" onChangeText={setSDT_KH}
                        value={SDT_KH}></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="envelope" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Email..." keyboardType="email-address" onChangeText={setEMAIL_KH}
                        value={EMAIL_KH}></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="map-location" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Địa chỉ..." onChangeText={setDIA_CHI_KH}
                        value={DIA_CHI_KH}></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="id-card-clip" style={styles.ic} />
                    <TextInput style={styles.ip} placeholder="Tên đăng nhập..." onChangeText={setTEN_DN_KH}
                        value={TEN_DN_KH}></TextInput>
                </View>
                <View style={styles.group}>
                    <Icon name="key" style={styles.ic} />
                    <TextInput style={styles.ip} secureTextEntry={secureTextEntry} placeholder="Mật khẩu..."
                                onChangeText={setMAT_KHAU_KH} value={MAT_KHAU_KH}></TextInput>
                    <Icon name={secureTextEntry ? "eye" : "eye-slash"} style={styles.ic2} onPress={() => setSecureTextEntry(!secureTextEntry)} />
                </View>
            </View>
            <View>
                <View>
                    <TouchableOpacity style={styles.btn}>
                        <Text style={{textAlign:'center', top:7, fontWeight:'bold', fontSize:22, color:'black'}} onPress={dinhnghiaPost}>Đăng ký</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{textAlign:'center', fontSize:16, color:'black', top:17}}>Bạn đã có tài khoản? <Text style={{textAlign:'center', fontSize:16, color:'blue', top:17}}
                            onPress={() => navigation.navigate('DangNhap')}>Đăng nhập ngay</Text></Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        height: 90,
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
        fontSize:26,
        textAlign: 'center',
        marginTop:8,
        marginBottom:8,
    },

    group:{
        marginTop:8,
        marginLeft:30,
        marginRight:30,
        zIndex:10,
    },

    ip:{
        borderWidth:1,
        backgroundColor:'#D9D9D9',
        borderRadius:2,
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
        marginTop:15,
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
    },

    ic2:{
        fontSize:22,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:14,
        right:15,
    },

})
export default DangKy;
