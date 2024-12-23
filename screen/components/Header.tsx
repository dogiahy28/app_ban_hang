import React from "react";
import { Text, View, Image, StyleSheet} from "react-native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Header = () =>{
    return (
        <View style={styles.container}>
                <Text>Hydanz</Text>
                <Image source={require('../../image/logo.png')}/>
                
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#DC2F2F'
    }

})
export default Header;