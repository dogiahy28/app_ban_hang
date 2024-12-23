import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Alert} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import anh_sp from './Hinhanh';
import axios from 'axios';

interface Notification {
    id: string;
    message: string;
}

type Props = {
    navigation: any;
};

const Thongbao = ({ navigation }: Props) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

    useEffect(() => {
        loadNotifications();
        getUnreadNotificationsCount();
    }, []);

    const getUnreadNotificationsCount = async () => {
        try {
            const unreadCount = await AsyncStorage.getItem('unreadNotifications');
            if (unreadCount !== null) {
                setUnreadNotifications(parseInt(unreadCount));
            }
        } catch (error) {
            console.error('Error getting unread notifications count:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const filteredKeys = keys.filter(key => key.startsWith('orderNotification_'));
            const storedNotifications: Notification[] = [];
            for (const key of filteredKeys) {
                const message = await AsyncStorage.getItem(key);
                if (message !== null) {
                    storedNotifications.push({ id: key, message }); // Thêm vào cuối mảng
                }
            }
            setNotifications(storedNotifications);
        } catch (error) {
            console.error('Error loading notifications from AsyncStorage:', error);
        }
    };

    const handleOpenModal = (notification: Notification) => {
        setSelectedNotification(notification);
        setIsModalVisible(true);
        // Giảm số lượng tin chưa đọc đi 1 khi người dùng bấm vào thông báo
        decreaseUnreadNotifications();
    
        // Lấy MA_HD từ notification
        const MA_HD = notification.id.replace('orderNotification_', '');
    
        // Chuyển hướng đến màn hình ThongtinHD với MA_HD tương ứng
        // navigation.navigate('ThongtinDH', { MA_HD });
    };
    

    const decreaseUnreadNotifications = async () => {
        try {
            const newUnreadCount = unreadNotifications - 1;
            setUnreadNotifications(newUnreadCount);
            await AsyncStorage.setItem('unreadNotifications', newUnreadCount.toString());
        } catch (error) {
            console.error('Error decreasing unread notifications count:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
    };

    const renderNotificationItem = ({ item }: { item: Notification }) => {
        const MA_HD = item.id.replace('orderNotification_', '');
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    item.id.includes('unread') ? styles.unreadNotification : styles.readNotification
                ]}
                onPress={() => handleOpenModal(item)}
            >
                <Text style={styles.notificationText}>
                    Đơn hàng <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{MA_HD}</Text> {item.message}
                </Text>
            </TouchableOpacity>
        );
    };

    // Định nghĩa hàm xử lý sự kiện xóa tất cả thông báo
    // const handleDeleteAllNotifications = async () => {
    //     try {
    //         // Xóa tất cả thông báo từ AsyncStorage
    //         const keys = await AsyncStorage.getAllKeys();
    //         const filteredKeys = keys.filter(key => key.startsWith('orderNotification_'));
    //         await AsyncStorage.multiRemove(filteredKeys);

    //         // Cập nhật giao diện người dùng
    //         setNotifications([]);
    //         setUnreadNotifications(0);
    //         Alert.alert('Thông báo', 'Đã xóa tất cả thông báo đã đọc thành công.');
    //     } catch (error) {
    //         console.error('Error deleting notifications:', error);
    //         Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa thông báo.');
    //     }
    // };

    const handleDeleteAllNotifications = async () => {
        try {
            Alert.alert(
                'Xác nhận',
                'Bạn có chắc chắn muốn xóa tất cả thông báo chưa đọc?',
                [
                    {
                        text: 'Hủy',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel'
                    },
                    {
                        text: 'Xóa',
                        onPress: async () => {
                            // Xóa tất cả thông báo từ AsyncStorage
                            const keys = await AsyncStorage.getAllKeys();
                            const filteredKeys = keys.filter(key => key.startsWith('orderNotification_'));
                            await AsyncStorage.multiRemove(filteredKeys);
    
                            // Cập nhật giao diện người dùng
                            setNotifications([]);
                            setUnreadNotifications(0);
                            // Alert.alert('Thông báo', 'Đã xóa tất cả thông báo đã đọc thành công.');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error deleting notifications:', error);
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa thông báo.');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="arrow-left" style={styles.ic1} onPress={() => navigation.goBack()} />
                <View style={styles.group}>
                    <Text style={{ color: 'white', fontSize: 26, top: 1, fontWeight: 'bold', left:40, }}>
                        Thông báo</Text>
                    {/* {unreadNotifications > 0 &&
                        <Text style={styles.notificationCount}>{unreadNotifications}</Text>} */}
                </View>
                <Icon name="trash" style={styles.ic2} onPress={handleDeleteAllNotifications} />
            </View>
            <View style={{top:2,height:690}}>
            <FlatList
                data={notifications}
                style={{top:2,marginBottom:138}}
                renderItem={renderNotificationItem}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>Không có thông báo nào.</Text>
                )}
            />
            </View>
            <View style={styles.footer}>
                <View style={styles.foot1}>
                    <Icon name="house-chimney" style={{fontSize:25,color:'black',left:24}}
                            onPress={() => navigation.navigate('TrangChu')}/>
                    <Text style={{fontSize:17,fontWeight:'bold'}}>Trang chủ</Text>
                </View>
                <View style={styles.foot2}>
                    <Icon name="thumbs-up" style={{fontSize:24,color:'black',left:18}}
                            onPress={() => navigation.navigate('GoiY')}/>
                    <Text style={{fontSize:17,fontWeight:'bold',left:8}}>Gợi ý</Text>
                </View>
                <View style={styles.foot3}>
                    <Icon name="bell" style={{fontSize:30,color:'black',left:28}}
                        onPress={() => navigation.navigate('Thongbao')}/>
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
};

const styles = StyleSheet.create({
    header:{
        backgroundColor:'#DC2F2F',
        height:65,
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
        color:'white',
        position:'absolute',
        zIndex:10000000,
        top:20,
        left:10,
    },

    ic2:{
        fontSize:22,
        color:'black',
        position:'absolute',
        zIndex:10000000,
        top:21,
        right:17,
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
        left:165,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    foot4:{
        left:263,
        top:11,
        fontSize:20,
        position:'absolute',
    },

    foot5:{
        left:330,
        top:12,
        fontSize:20,
        position:'absolute',
    },

    notificationItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    notificationText: {
        color:'#000000',
        fontSize: 17,
        top:1,
        left:5,
        right:10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 17,
    },

    notificationCount: {
        position: 'absolute',
        zIndex: 10000001,
        top: 2,
        right: 16,
        backgroundColor: 'white',
        color: 'black',
        borderRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 2,
        fontSize: 14,
    },

    unreadNotification: {
        backgroundColor: 'lightgray', // Màu xám cho thông báo chưa đọc
    },

    readNotification: {
        backgroundColor: 'white', // Màu trắng cho thông báo đã đọc
    },
});

export default Thongbao;
