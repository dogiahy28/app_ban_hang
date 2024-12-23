import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';

const Thongtin = () => {
    const navigation = useNavigation();
    const [MA_CCCD, setMA_CCCD] = useState('');
    const [TEN_KH, setTEN_KH] = useState('');
    const [SDT_KH, setSDT_KH] = useState('');
    const [EMAIL_KH, setEMAIL_KH] = useState('');
    const [DIA_CHI_KH, setDIA_CHI_KH] = useState('');

    useEffect(() => {
        const getCustomerData = async () => {
            try {
                const MA_CCCD_value = await AsyncStorage.getItem('MA_CCCD');
                const TEN_KH_value = await AsyncStorage.getItem('TEN_KH');
                const SDT_KH_value = await AsyncStorage.getItem('SDT_KH');
                const EMAIL_KH_value = await AsyncStorage.getItem('EMAIL_KH');
                const DIA_CHI_KH_value = await AsyncStorage.getItem('DIA_CHI_KH');
                if (MA_CCCD_value !== null && TEN_KH_value !== null && SDT_KH_value !== null && EMAIL_KH_value !== null && DIA_CHI_KH_value !== null) {
                    setMA_CCCD(MA_CCCD_value);
                    setTEN_KH(TEN_KH_value);
                    setSDT_KH(SDT_KH_value);
                    setEMAIL_KH(EMAIL_KH_value);
                    setDIA_CHI_KH(DIA_CHI_KH_value);
                }
            } catch (error) {
                console.log(error);
            }
        };
        getCustomerData();
    }, []);

    const handleUpdate = async () => {
        // Kiểm tra các ô TextInput có trống không
        if (!TEN_KH || !SDT_KH || !EMAIL_KH || !DIA_CHI_KH) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
    
        try {
            // Thực hiện cập nhật nếu không có ô TextInput nào trống
            const response = await fetch('http://192.168.56.1:3000/updateCustomer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    MA_CCCD: MA_CCCD,
                    TEN_KH: TEN_KH,
                    SDT_KH: SDT_KH,
                    EMAIL_KH: EMAIL_KH,
                    DIA_CHI_KH: DIA_CHI_KH
                }),
            });
            const data = await response.json();
            console.log(data);
            // Cập nhật lại các biến trong AsyncStorage sau khi cập nhật thành công
            await AsyncStorage.setItem('TEN_KH', TEN_KH);
            await AsyncStorage.setItem('SDT_KH', SDT_KH);
            await AsyncStorage.setItem('EMAIL_KH', EMAIL_KH);
            await AsyncStorage.setItem('DIA_CHI_KH', DIA_CHI_KH);
            // Hiển thị thông báo hoặc thực hiện các hành động khác sau khi cập nhật thành công
            Alert.alert('Thông báo', 'Cập nhật thông tin thành công');
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin khách hàng:', error);
            // Hiển thị thông báo lỗi
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại sau');
        }
    };


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic} onPress={() => navigation.goBack()} />
                <Text style={styles.title}>Cập nhật thông tin cá nhân</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.label}>Tên khách hàng:</Text>
                <TextInput
                    style={styles.textInput}
                    value={TEN_KH}
                    onChangeText={setTEN_KH}
                />
                <Text style={styles.label}>Số điện thoại:</Text>
                <TextInput
                    style={styles.textInput}
                    value={SDT_KH}
                    onChangeText={setSDT_KH}
                />
                <Text style={styles.label}>Email:</Text>
                <TextInput
                    style={styles.textInput}
                    value={EMAIL_KH}
                    onChangeText={setEMAIL_KH}
                />
                <Text style={styles.label}>Địa chỉ:</Text>
                <TextInput
                    style={styles.textInput}
                    value={DIA_CHI_KH}
                    onChangeText={setDIA_CHI_KH}
                />
                <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                    <Text style={styles.buttonText}>Cập nhật</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        height: 60,
    },
    ic: {
        fontSize: 26,
        color: '#DC2F2F',
        marginRight: 10,
        left:10,
    },
    title: {
        fontSize: 21,
        color: 'black',
        fontWeight: 'bold',
        paddingLeft:15,
    },
    info: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#DC2F2F',
        top:10,
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        width:170,
        left:97,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default Thongtin;
