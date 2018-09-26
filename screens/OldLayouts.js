
/* unsplash header in home screen in featured tab with search input under the header */

{
    !this.props.screenProps.user ? 
    <View style={{ padding: 20, paddingTop: 94, justifyContent: 'center', alignItems: 'center', }}>
        <Text style={{ fontFamily: 'PlayfairDisplay-Bold', fontSize: 30, color: 'black', letterSpacing: 0.5 }}>unsplash</Text>
        <TextInput
            value={this.state.query}
            onChangeText={(text) => this.setState({ query: text })}
            ref={(input) => { this.secondTextInput = input; }}
            style={styles.searchInput}
            onSubmitEditing={(event) => this.searchPhotos(event.nativeEvent.text)}
            placeholder='Search Photos or Collections..'
            placeholderTextColor='#888'
            underlineColorAndroid={'transparent'}
            />
    </View> : null
}


/* unsplash header for collection details */

import React, {Component} from 'react';
import {Image, StyleSheet, View, Dimensions, Text, ImageBackground, ActivityIndicator, StatusBar, FlatList, TouchableWithoutFeedback} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ScalableImage from 'react-native-scalable-image';
import { StackActions } from 'react-navigation';

//constants
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CLIENT_ID = 'client_id=9c083d69e5c868ac45cb94a84f5e4ec338d890091b2a599176ea89795622fb4f';
const API_ENDPOINT = 'https://api.unsplash.com/';

export default class CollectionDetails extends React.Component {

    static navigationOptions = {
        headerTransparent: true,
        headerTintColor: '#555',
        headerStyle: {
            marginTop: 24,
        }
    };
    
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            collecion: {},
            isLoading: true
        }
    }

    async componentDidMount() {
        this.setState({
            photos: await this.getCollectionPhotos(),
            collection: await this.getCollection()
        })
    }

    componentWillUnmount() {
        this.props.navigation.state.params.onNavigateBack ? this.props.navigation.state.params.onNavigateBack() : null
    }

    updateLayout = (value) => {
        this.setState({
            isListLayout: value
        })
    }

    getCollection = () => {
        let collectionDetails = this.props.navigation.getParam('collectionDetails', {});
        let request = `${API_ENDPOINT}collections/${collectionDetails.id}?${CLIENT_ID}`
        return fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    isLoading: false
                })
                return responseJson;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getCollectionPhotos = () => {
        let collectionDetails = this.props.navigation.getParam('collectionDetails', {});
        let request = `${API_ENDPOINT}collections/${collectionDetails.id}/photos?${CLIENT_ID}`
        return fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /* navigate screens */
    pushToImageDetails = (details) => {
        let pushAction = StackActions.push({
            routeName: 'ImageDetails', 
            params: {
                imageDetails: details,
            }
        });
        this.props.navigation.dispatch(pushAction);
    }

    render() {
        const {navigation} = this.props;
        const collectionDetails = navigation.getParam('collectionDetails', {});
        var tags = []
        if(this.state.collection){
            for (let i = 0; i < this.state.collection.tags.length; i++) {
                tags.push(
                    <View style={styles.tagContainer}>
                        <Text style={styles.tag}>{this.state.collection.tags[i].title.toUpperCase()}</Text>
                    </View>
                )
                if(i == 5)
                    break;
            }
        }
        return (
            <View style={styles.scrollContainer}>
                <StatusBar barStyle='dark-content' backgroundColor={'rgba(0,0,0,0)'} translucent={true} />
                <FlatList
                    ListHeaderComponent={
                        <ImageBackground source={{uri: collectionDetails.cover_photo.urls.regular}} style={styles.coverPhoto}>
                            <LinearGradient colors={['rgba(255,255,255,.6)', 'rgba(255,255,255,1)', 'rgba(255,255,255,1)']} style={styles.whiteGradient}>
                                <Text style={styles.collectionName}>{collectionDetails.title.toUpperCase()}</Text>
                                <View style={styles.tagView}>
                                {tags}
                                </View>
                                {
                                    collectionDetails.description ? 
                                    <Text style={styles.collectionDesc}>{collectionDetails.description}</Text> : 
                                    this.state.isLoading ?
                                    <View>
                                    <ActivityIndicator size="small" color="#333" /> 
                                    </View>: null
                                }
                                <View style={styles.userContainer}>
                                <Image source={{uri: collectionDetails.user.profile_image.medium}} style={styles.avatar}></Image>
                                <Text style={styles.userName}>by {collectionDetails.user.name}</Text>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                    }
                    showsVerticalScrollIndicator={false}
                    data={this.state.photos}
                    keyExtractor={(item, index) => item.id.toString()}
                    renderItem={({ item, index }) =>
                    <TouchableWithoutFeedback onPress={() => this.pushToImageDetails(item)}>
                        <ScalableImage
                            isCollection={false}
                            data={item}
                            background={true}
                            width={Dimensions.get('window').width} // height will be calculated automatically
                            source={{ uri: item.urls.small }}
                        />
                    </TouchableWithoutFeedback>
                    }
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    scrollContainer: {
        backgroundColor: 'white',
    },
    coverPhoto: {
        elevation: 4,
        width: windowWidth,
    },
    whiteGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    collectionName: {
        marginTop: 74,
        fontSize: 16,
        letterSpacing: 0.5,
        fontFamily: 'Metropolis-Bold',
        // fontWeight: '700',
        color: '#333',
        textAlign: 'center',
        width: '100%'
    },
    collectionInfo: {
        height: 60,
        elevation: 4,
        backgroundColor: '#fff'
    },
    collectionDesc: {
        marginTop: 15,
        paddingHorizontal: 30,
        fontFamily: 'Metropolis-Regular',
        color: '#555',
        fontSize: 14,
        textAlign: 'center'
    },
    avatar: {
        alignSelf: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userContainer: {
        marginVertical: 20,
    },
    userName: {
        marginTop: 10,
        letterSpacing: 1,
        alignSelf: 'center',
        fontFamily: 'SpaceMono-Regular',
        fontSize: 12,
        color: '#555'
    },
    tagContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 3,
        margin: 3,
        padding: 5
    },
    tag: {
        fontSize: 11,
        color: '#bbb',
        fontWeight: '700'
    },
    tagView: {
        flexDirection: 'row', 
        marginVertical: 10,
        paddingHorizontal: 20, 
        alignSelf: 'center'
    }
})