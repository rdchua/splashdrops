import React, { Component } from 'react'
import { Image, Dimensions, StyleSheet, View, Text } from 'react-native'
import VectorIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CustomImage extends React.Component {
    
    constructor(props){
        super(props)
    }

    render() {

        return (
            <View style={{width: '100%', paddingVertical: 20, paddingHorizontal: '20%'}}>
                <View style={{flexDirection: 'row'}}>
                    <VectorIcon name={this.props.icon} size={22} color='#000' style={{marginRight: 10, alignSelf: 'center'}}/>
                    <View>
                        <Text style={{fontFamily: 'Metropolis-Regular', color: '#555', fontSize: 11}}>{this.props.title}</Text>
                        <Text style={{fontFamily: 'SpaceMono-Regular', color: '#000', fontSize: 13}} numberOfLines={1}>{this.props.value ? this.props.value : 'N/A'}</Text>
                    </View>
                </View>
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