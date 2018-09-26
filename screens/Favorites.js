import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text, View, FlatList, ScrollView, Dimensions} from 'react-native';
import CustomImage from '../components/CustomImage'

const ACCESS_KEY   = '9c083d69e5c868ac45cb94a84f5e4ec338d890091b2a599176ea89795622fb4f';
const SECRET_KEY   = '5df3d8270ab92f4f3f6f7f9ea4b21df7de6c690d3efbbc3502791dd097278674';
const CLIENT_ID = 'client_id=7a2ce295655ad90de5c9e0b7f61379c3f66596a0e7a9c1145565ef50b4c056fa';
const API_ENDPOINT = 'https://api.unsplash.com/';

const windowWidth = Dimensions.get('window').width

export default class Home extends React.Component {

    constructor() {
        super();
        this.state = {
            photos: []
        }
    }

    async componentDidMount(){
        this.setState({
            photos: await this.getFeaturedCollection()
        });
    }

    getFeaturedCollection() {
        return fetch(API_ENDPOINT + 'collections/curated?per_page=50;' + CLIENT_ID)
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson;
            })
            .catch((error) => {
                console.error(error);
            });
    }
    
    render() {
        if(this.state.photos.length > 0){
            var firstColumn = [];
            var secondColumn = [];
            for(let i = 0; i < this.state.photos.length; i+=2){
                firstColumn.push(
                    <CustomImage key={i}
                        originalWidth={this.state.photos[i].cover_photo.width} 
                        originalHeight={this.state.photos[i].cover_photo.height}
                        source={this.state.photos[i].cover_photo.urls.small}/>
                );
                secondColumn.push(
                    <CustomImage key={i+1}
                        originalWidth={this.state.photos[i+1].cover_photo.width} 
                        originalHeight={this.state.photos[i+1].cover_photo.height}
                        source={this.state.photos[i+1].cover_photo.urls.small}/>
                );
            }
            return (
                <View style={styles.mainContainer}>
                    <Text style={styles.header}>Unsplash</Text>
                    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
                        <StatusBar backgroundColor="white" barStyle="dark-content" />
                        <View style={[styles.imageContainer, {width: windowWidth / 2}]}>
                            {firstColumn}
                        </View>
                        <View style={[styles.imageContainer, {width: windowWidth / 2}]}>
                            {secondColumn}
                        </View>
                    </ScrollView>
                </View>
            );
        }
        else {
            return (
                <View>
                    <Text>NONE</Text>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    contentContainerStyle: {
        flexDirection: 'row',
    },
    imageContainer: {
        flex: 1,
        flexDirection: 'column',
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    image: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
    },
    header: {
        marginTop: 10,
        fontSize: 30,
        fontWeight: '700',
        color: 'black',
        marginLeft: 5,
        marginBottom: 20,
    }
});
