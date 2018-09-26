import React, {Component} from 'react';
import {Image, StyleSheet, View, Dimensions, Text, ImageBackground, ActivityIndicator, StatusBar, FlatList, TouchableWithoutFeedback, TouchableOpacity, PermissionsAndroid} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import VectorIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScalableImage from 'react-native-scalable-image';
import { StackActions } from 'react-navigation';
import RNFetchBlob from 'rn-fetch-blob'
import withPreventDoubleClick from '../withPreventDoubleClick';
const TouchableOpacityEx = withPreventDoubleClick(TouchableOpacity);
import Toast from 'react-native-custom-toast';
//constants
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CLIENT_ID = 'client_id=7a2ce295655ad90de5c9e0b7f61379c3f66596a0e7a9c1145565ef50b4c056fa';
const API_ENDPOINT = 'https://api.unsplash.com/';
var link_parser = require('parse-link-header');

export default class CollectionDetails extends React.Component {

    static navigationOptions = {
        headerTransparent: true,
        headerTintColor: '#000',
        headerStyle: {
            paddingTop: 20
        }
    };
    
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            collecion: {},
            isLoading: true,
            page: 1,
            lastPage: 10
        }
    }

    componentDidMount() {
        this.getCollectionPhotos()
        this.getCollection()
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
        this.setState({isLoading: true})
        let collectionDetails = this.props.navigation.getParam('collectionDetails', {});
        let request = `${API_ENDPOINT}collections/${collectionDetails.id}?${CLIENT_ID}`
        return fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    collection: responseJson
                }, () => {this.setState({isLoading: false})})
            })
            .catch((error) => {
                console.error(error);
            });
    }

    getCollectionPhotos = () => {
        this.setState({isLoading: true})
        if(this.state.page <= this.state.lastPage){
            let collectionDetails = this.props.navigation.getParam('collectionDetails', {});
            let request = `${API_ENDPOINT}collections/${collectionDetails.id}/photos?page=${this.state.page};per_page=50;${CLIENT_ID}`;
            console.log(request)
            return fetch(request).then((response) => {  
                response.headers.get('link') ? this.setState({lastPage: link_parser(response.headers.get('link')).last.page}) : null
                response.json().then((responseJson) => {
                    this.setState({
                        photos: this.state.page == 1 ? responseJson : [...this.state.photos, ...responseJson]
                    }, () => {this.setState({isLoading: false})})
                })
                .catch((error) => {
                    console.error(error);
                });
            }) 
        }
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

    pushToProfile = (details) => {
        let pushAction = StackActions.push({
            routeName: 'Profile',
            params: {
                userDetails: details,
            }
        });
        this.props.navigation.dispatch(pushAction);
    }

    handleLoadMore = () => {
        this.setState({
            page: this.state.page + 1
        }, () => {this.getCollectionPhotos()})
    }

    downloadImage = (url, id) => {
        this.requestFileAccess();
        let dirs = RNFetchBlob.fs.dirs
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                this.refs.customToast.showToast('Downloading image...', 5000);
                RNFetchBlob.config({
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        path: `${dirs.DownloadDir}/${id}.jpg`,
                        description: 'Downloading image.'
                    },
                    fileCache: true,
                }).fetch('GET', responseJson.url, {
                    //some headers ..
                }).progress((received, total) => {
                    console.log(received + '/' + total)
                }).then((res) => {
                    console.log('The file saved to ' + res.path())
                })
            })
            .catch((error) => {
                this.refs.customToast.showToast('Downloading failed', 5000);
                console.error(error);
            });
    }

    requestFileAccess = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE, {
                    'title': 'We need access to your storage',
                    'message': 'We need access to your storage so we can store your downloaded files on to your device.'
                }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permission granted")
            } else {
                console.log("Permission denied")
            }
        } catch (err) {
            console.warn(err)
        }
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
                if(i == 3)
                    break;
            }
        }
        return (
            <View style={styles.scrollContainer}>
            < Toast ref = "customToast"
            position = "bottom"
            backgroundColor = "#fff" / >
                <StatusBar barStyle='dark-content' backgroundColor={'rgba(0,0,0,0)'} hidden={true} />
                <FlatList
                    ListHeaderComponent={
                        <ImageBackground source={{uri: collectionDetails.cover_photo.urls.regular}} style={styles.coverPhoto}>
                            <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']} style={styles.whiteGradient}>
                                <View style={{position: 'absolute', bottom: 50, left: 20}}>
                                <View style={styles.tagView}>
                                    {tags}
                                </View>
                                    <TouchableOpacityEx onPress={() => this.pushToProfile(collectionDetails.user)}>
                                        <Text style={styles.collectionName}>{collectionDetails.title.toUpperCase()}</Text>
                                        <Text style={styles.datePublished}>by {collectionDetails.user.name}</Text>
                                    </TouchableOpacityEx>
                                    {
                                        collectionDetails.description ? 
                                        <Text style={styles.collectionDesc}>{collectionDetails.description}</Text> : 
                                        this.state.isLoading ?
                                        <View>
                                            <ActivityIndicator size="small" color="#333" /> 
                                        </View>: null
                                    }
                                </View>
                                <View style={styles.actionContainer}>
                                    < TouchableOpacityEx onPress = {
                                        () => this.downloadImage(`${collectionDetails.cover_photo.links.download_location}?${CLIENT_ID}`, collectionDetails.cover_photo.id)
                                    } >
                                        <VectorIcon style={styles.actionIcon} name={'download'} size={18} color={'white'}/>
                                    </TouchableOpacityEx>
                                    <TouchableOpacityEx>
                                        <VectorIcon style={styles.actionIcon} name={'heart-outline'} size={18} color={'white'}/>
                                    </TouchableOpacityEx>
                                </View>
                            </LinearGradient>
                        </ImageBackground>}
                    showsVerticalScrollIndicator={false}
                    data={this.state.photos}
                    keyExtractor={(item, index) => item.id.toString()}
                    renderItem={({ item, index }) =>
                    index == 0 ? null :
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
        width: windowWidth,
        height: windowHeight + 50
    },
    whiteGradient: {
        paddingLeft: 20,
        width: '100%',
        position: 'absolute',
        bottom: 0,
        height: 200
    },
    collectionName: {
        marginTop: 10,
        paddingRight: 40,
        fontSize: 24,
        letterSpacing: 1,
        // fontFamily: 'Metropolis-SemiBold',
        fontWeight: '700',
        color: '#fff',
    },
    collectionInfo: {
        height: 60,
        elevation: 4,
        backgroundColor: '#fff'
    },
    collectionDesc: {
        marginTop: 10,
        // paddingHorizontal: 30,
        // fontFamily: 'SpaceMono-Regular',
        color: '#ccc',
        fontSize: 12,
        paddingRight: 150,
        // textAlign: 'center'
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
        marginLeft: 10,
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
        color: '#888',
        fontWeight: '700',
    },
    tagView: {
        marginLeft: -2.5,
        flexDirection: 'row', 
        marginVertical: 10,
        paddingRight: 100,
    },
    datePublished: {
        fontSize: 12,
        color: '#ccc',
        marginTop: 2,
    },
    actionContainer: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 50,
        right: 10
    },
    actionIcon: {
        paddingHorizontal: 10
    },
})