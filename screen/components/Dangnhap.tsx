import React, { useState } from "react";
import { Text, View, Image, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NavigationContainer, useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
    navigation: any;
};

const DangNhap = (props: Props) => {
    const { navigation } = props;

    const [TEN_DN_KH, setTEN_DN_KH] = useState('');
    const [MAT_KHAU_KH, setMAT_KHAU_KH] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const handleLogin = async () => {
        try {
            if (TEN_DN_KH === '') {
                Alert.alert('Thông báo', 'Vui lòng nhập tên đăng nhập!');
                return;
            }
            if (MAT_KHAU_KH === '') {
                Alert.alert('Thông báo', 'Vui lòng nhập mật khẩu!');
                return;
            }
            const response = await fetch('http://192.168.56.1:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    TEN_DN_KH: TEN_DN_KH,
                    MAT_KHAU_KH: MAT_KHAU_KH,
                }),
            });
            const data = await response.json();
    
            if (response.ok) {
                if (data.MA_CCCD) {
                    // Lưu các biến vào AsyncStorage
                    await AsyncStorage.setItem('MA_CCCD', data.MA_CCCD);
                    await AsyncStorage.setItem('TEN_KH', data.TEN_KH);
                    await AsyncStorage.setItem('SDT_KH', data.SDT_KH);
                    await AsyncStorage.setItem('EMAIL_KH', data.EMAIL_KH);
                    await AsyncStorage.setItem('DIA_CHI_KH', data.DIA_CHI_KH);

                    Alert.alert(
                        `Xin chào ${data.TEN_KH}`,
                        'Chào mừng bạn đã đến với Hydanz!',
                    );
                    navigation.navigate('TrangChu');
                } else {
                    Alert.alert('Thông báo', 'Có lỗi xảy ra khi đăng nhập');
                }
            } else {
                Alert.alert(
                    'Thông báo',
                    'Tên đăng nhập hoặc mật khẩu không đúng! Vui lòng nhập lại.',
                );
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Internal server error');
        }
    };


    // Function to reset TextInput values
    const resetTextInput = () => {
        setTEN_DN_KH('');
        setMAT_KHAU_KH('');
    };

    // Use focus effect to trigger resetTextInput when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            resetTextInput();
        }, [])
    );

    return (
        <View style={{backgroundColor:'white'}}>
            <View style={{top:20, left:10}}>
                <Icon name="arrow-left" size={28} color="black" onPress={() => navigation.navigate('DangKy')} />
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
                <Image source={require('../../assets/image/hello.png')}/>
            </View>
            <View style={styles.group}>
                <Icon name="address-card" style={styles.ic} />
                <TextInput
                    style={styles.ip}
                    placeholder="Tên đăng nhập..."
                    value={TEN_DN_KH}
                    onChangeText={setTEN_DN_KH}
                />
            </View>
            <View style={styles.group}>
                    <Icon name="key" style={styles.ic} />
                    <TextInput style={styles.ip} secureTextEntry={secureTextEntry} placeholder="Mật khẩu..."
                                onChangeText={setMAT_KHAU_KH} value={MAT_KHAU_KH}></TextInput>
                    <Icon name={secureTextEntry ? "eye" : "eye-slash"} style={styles.ic2} onPress={() => setSecureTextEntry(!secureTextEntry)} />
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleLogin}>
                <Text style={{textAlign:'center', top:7, fontWeight:'bold', fontSize:22, color:'black'}}>Đăng nhập</Text>
            </TouchableOpacity>
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
    name:{
        fontWeight:'bold',
        color:'black',
        fontSize:28,
        textAlign: 'left',
        marginTop:40,
        marginLeft:12,
    },
    name2:{
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
    },

    ic2: {
        position: 'absolute',
        zIndex: 10000000,
        top: 14,
        right: 15,
        fontSize: 22,
        color: 'black',
    },
});

export default DangNhap;
