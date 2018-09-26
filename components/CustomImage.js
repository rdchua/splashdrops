import React, { Component } from 'react'
import { Image, Dimensions, StyleSheet, View, Text } from 'react-native'
import VectorIcon from 'react-native-vector-icons/Feather';

export default class CustomImage extends React.Component {
    
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
                <Image
                resizeMethod={this.props.resize ? 'resize': 'auto'} 
                source={{ uri: this.props.source}} 
                style={[this.props.style, { 
                    alignSelf: 'center', 
                    width: newWidth, 
                    height: newHeight > 200 && !isListLayout ? newHeight : newHeight + 30}]}/>
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