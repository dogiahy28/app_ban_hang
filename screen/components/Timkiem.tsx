import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import anh_sp from './Hinhanh';
import { RouteProp} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  TimKiem: { keyword: string };
};

type Props = {
  route: RouteProp<RootStackParamList, 'TimKiem'>;
  navigation: any;
};

const TimKiem = (props: Props) => {
  const { keyword } = props.route.params || { keyword: '' };
  const [loading, setLoading] = useState(true);
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const { navigation } = props;
  const [cartItemCount, setCartItemCount] = useState(0); // State to hold cart item count

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
      const response = await axios.post('http://192.168.56.1:3000/search', { keyword });
      setSearchResult(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [keyword, navigation]);

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
      setSearchResult(response.data);
    } catch (error) {
      console.error('Error searching for products:', error);
    }
  };

  const renderProductImage = (item: any) => {
    const index = item.MA_SP - 1; 
    const imageSource = anh_sp[index % anh_sp.length].source; 
    const imageId = anh_sp[index % anh_sp.length].id;

    return (
      <Image key={imageId} source={imageSource} style={{ width: 175, height: 180 }} />
    );
  };

  const renderSearchResultItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.searchResultItem, searchResult.length === 1 ? styles.singleItem : null]}>
        <TouchableOpacity onPress={() => (navigation.navigate('ChiTiet', { item }))}>
          {renderProductImage(item)}
        </TouchableOpacity>
        <Text style={{ top: 2, fontSize: 16, textAlign: 'center' }}>
          {item.TEN_SP}
        </Text>
        <Text style={{ marginTop: 10, marginBottom: 10, color: item.SO_LUONG < 1 ? 'red' : '#DC2F2F', fontSize: 18, textAlign: 'left' }}>
          {item.SO_LUONG < 1 ? 'HẾT HÀNG!' : parseFloat(item.GIA_BAN).toLocaleString('vi-VN') + 'đ'}
        </Text>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="arrow-left" style={styles.headerIcon} size={30} color="black" onPress={() => navigation.goBack()} />
        <View style={styles.searchBar}>
          <Icon name="magnifying-glass" style={styles.searchBarIcon} />
          <TextInput style={styles.searchBarInput} placeholder="Tìm sản phẩm..." value={keyword} />
        </View>
        <Icon name="cart-shopping" style={styles.ic2} onPress={() => navigation.navigate('GioHang')} />
                    {cartItemCount > 0 && 
                    <Text style={styles.cartItemCount}>{cartItemCount}</Text>}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : searchResult.length === 0 ? (
        <Text style={styles.noProductText}>Không tìm thấy sản phẩm</Text>
      ) : (
        <FlatList
          data={searchResult}
          renderItem={renderSearchResultItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.searchResultList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
        height:545,
        marginTop: 0,
        marginBottom: 0,
  },
  header: {
    backgroundColor: '#DC2F2F',
    height: 75,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    left: 10,
  },
  searchBar: {
    marginTop: 0,
    marginLeft: 28,
    marginRight: 30,
    zIndex: 10,
    height: 45,
    width: 280,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 7,
  },
  searchBarIcon: {
    fontSize: 22,
    color: 'black',
  },
  searchBarInput: {
    flex: 1,
    paddingLeft: 10,
  },
  searchBarButton: {
    backgroundColor: '#D9D9D9',
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: 60,
    borderRadius: 3,
  },
  searchBarButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  searchResultList: {
    padding: 10,
  },
  searchResultItem: {
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
  searchResultItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    backgroundColor: '#f2f1ed',
  },
  noProductText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },

  ic2:{
    fontSize:27,
    color:'black',
    position:'absolute',
    zIndex:10000000,
    top:26,
    right:24,
  },

  cartItemCount: {
    position: 'absolute',
    zIndex: 10000001,
    top: 15,
    right: 20,
    backgroundColor: 'white',
    color: 'black',
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 12,
  },

  singleItem: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

});

export default TimKiem;