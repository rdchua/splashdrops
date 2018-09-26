import React, { Component } from 'react'
import { Image, Dimensions, StyleSheet, View, Text } from 'react-native'
import VectorIcon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

export default class CustomImageCollection extends React.Component {
    
    constructor(props){
        super(props)
    }
    
    render() {
        var isListLayout = this.props.columns < 2 ? true : false;
        let padding = this.props.columns < 2 ? 0 : 16;
        let windowWidth = Dimensions.get('window').width / this.props.columns
        let widthChange = (windowWidth - padding) / this.props.originalWidth
        let newWidth = this.props.originalWidth * widthChange
        let newHeight = this.props.originalHeight * widthChange
        return (
            <View>
                <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.15)', 'transparent']} style={styles.linearGradient}>
                    <View style={styles.dataContainer}>
                        <Text style={styles.noOfPhotos}>{this.props.data.total_photos} photos</Text>
                        <Text 
                        numberOfLines={1}
                        style={styles.title}>{this.props.data.title}</Text>
                    </View>
                </LinearGradient>
                <Image
                resizeMethod='resize' 
                source={{ uri: this.props.source}} 
                style={[this.props.style, { 
                    alignSelf: 'center', 
                    width: newWidth, 
                    height: newHeight > 200 ? newHeight : newHeight + 30}]}/>
                {
                    this.props.user ? 
                    <View>
                        <Text style={styles.userName}>{this.props.user.name}</Text>
                        <View style={styles.actionContainer}>
                            <VectorIcon style={styles.actionIcon} name={'arrow-down-circle'} size={16} color={'white'}/>
                            <VectorIcon style={styles.actionIcon} name={'layers'} size={16} color={'white'}/>
                            <VectorIcon style={styles.actionIcon} name={'heart'} size={16} color={'white'}/>
                        </View>
                    </View> : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    title: {
        marginTop: 2.5,
        color: 'white',
        fontSize: 14,
        fontFamily: 'Metropolis-SemiBold'
    },
    noOfPhotos: {
        color: 'white',
        fontSize: 12,
    },
    dataContainer: {
        padding: 15,
    },
    linearGradient: {
        zIndex: 10,
        width: '93.5%',
        margin: 6, 
        position: 'absolute', 
        top: 0, 
        left: 0, 
    },
    userName: {
        position: 'absolute',
        bottom: 15,
        left: 10,
        color: 'white',
        fontFamily: 'Metropolis-medium',
        letterSpacing: 0.8
    },
    actionContainer: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 15,
        right: 10
    },
    actionIcon: {
        paddingHorizontal: 10
    }
});