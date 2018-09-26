import React, { Component } from 'react';
import {
    Alert,
    AsyncStorage,
    Image,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    PermissionsAndroid,
    StatusBar,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Dimensions,
} from 'react-native'; 
import Toast from 'react-native-custom-toast';
import { StackActions } from 'react-navigation';
import LinearGradient from 'react-native-linear-gradient';
import VectorIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Details from '../components/PhotoDetails'
import RNFetchBlob from 'rn-fetch-blob'
const CLIENT_ID = 'client_id=7a2ce295655ad90de5c9e0b7f61379c3f66596a0e7a9c1145565ef50b4c056fa';
const API_ENDPOINT = 'https://api.unsplash.com/';
import withPreventDoubleClick from '../withPreventDoubleClick';
const TouchableOpacityEx = withPreventDoubleClick(TouchableOpacity);

export default class ImageDetails extends React.Component {

    static navigationOptions = {
        headerTransparent: true,
        headerTintColor: 'rgba(255,255,255,1)',
        headerStyle: {
            paddingTop: 20
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            photo: {},
            scrollViewHeight: 0,
            scrollViewWidth: 0,
        }
    }

    async componentDidMount(){
        this.setState({
            photo: await this.getPhotoDetails()
        })
    }

    componentWillUnmount(){
        this.props.navigation.state.params.onNavigateBack ? this.props.navigation.state.params.onNavigateBack() : null
    }

    getPhotoDetails(){
        let {navigation} = this.props;
        let imageDetails = navigation.getParam('imageDetails', {});
        let request = API_ENDPOINT + 'photos/' + imageDetails.id + '?' + CLIENT_ID;
        return fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /* navigate screens */
    pushToProfile = (details) => {
        let pushAction = StackActions.push({
            routeName: 'Profile',
            params: {
                userDetails: details,
            }
        });
        this.props.navigation.dispatch(pushAction);
    }

    likeImage(image){
        AsyncStorage.getItem('likes')
            .then(req => {
                let likes;
                if(req) {
                    likes = JSON.parse(req).concat(image);
                } else {
                    likes = [];
                    likes.push(image)
                }
                console.log(`likes length: ${likes.length}`)
                AsyncStorage.setItem('likes', JSON.stringify(likes))
                .then(json => console.log('success!'))
                .catch(error => console.log('error!'));
        })
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
        const imageDetails = navigation.getParam('imageDetails', {});
        return(
            <ImageBackground source={{uri: imageDetails.urls.regular}} style={{height: '100%', width: '100%'}}>
                <Toast ref = "customToast"
                position="top"
                backgroundColor = "#fff" />
                <StatusBar barStyle='light-content' hidden={true}/>
                <ScrollView style={styles.scrollView}
                 ref="scrollView" 
                 showsVerticalScrollIndicator={false}
                 onLayout={(event) => {
                        var {width, height} = event.nativeEvent.layout;
                        this.setState({
                            scrollViewHeight: height,
                            scrollViewWidth: width
                        })
                    }}>
                    < View style = {[styles.userContainer, { marginTop: imageDetails.user.location ? this.state.scrollViewHeight - 95 : this.state.scrollViewHeight - 80}]} >
                        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']} style={styles.linearGradient}>
                            <TouchableOpacityEx onPress={() => this.pushToProfile(imageDetails.user)}>
                                <Image source={{uri: imageDetails.user.profile_image.medium}} style={styles.avatar}></Image>
                                <Text style={styles.userName}>{imageDetails.user.name}</Text>
                                <Text style={styles.userLocation}>{imageDetails.user.location}</Text>
                            </TouchableOpacityEx>
                        </LinearGradient>
                        <View style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
                            <View style={styles.imageDetailsContainer}>
                            {
                                (this.state.photo.location || this.state.photo.exif) ?
                                <View>
                                    <View>
                                        <Text style={[styles.actionText, {marginTop: 15}]}>{this.state.photo.location? this.state.photo.location.title : '-'}</Text>
                                        <Text style={[styles.actionText, {marginTop: 5}]}>{this.state.photo.created_at}</Text>
                                    </View>
                                    <View style={styles.actionContainer}>
                                        <TouchableOpacityEx style={styles.action} onPress={() => this.downloadImage(`${imageDetails.links.download_location}?${CLIENT_ID}`, imageDetails.id)}>
                                            <VectorIcon style={styles.actionIcon} name='download' size={20} color='#000'/>
                                            <View>
                                                <Text style={styles.actionText}>{this.state.photo.downloads}</Text>
                                                <Text style={[styles.actionText, {marginTop: 2}]}>Download</Text>
                                            </View>
                                        </TouchableOpacityEx>
                                        <TouchableOpacityEx style={styles.action} onPress={() => this.handlePress(true)}>
                                            <VectorIcon style={styles.actionIcon} name='bookmark-outline' size={20} color='#000'/>
                                            <View>
                                                <Text style={styles.actionText}>-</Text>
                                                <Text style={[styles.actionText, {marginTop: 2}]}>Bookmark</Text>
                                            </View>
                                        </TouchableOpacityEx>
                                        <TouchableOpacityEx style={styles.action} onPress={() => this.likeImage(imageDetails)}>
                                            <VectorIcon style={styles.actionIcon} name='heart-outline' size={20} color='#000'/>
                                            <View>
                                                <Text style={styles.actionText}>{this.state.photo.likes}</Text>
                                                <Text style={[styles.actionText, {marginTop: 2}]}>Likes</Text>
                                            </View>
                                        </TouchableOpacityEx>
                                    </View>
                                    <View style={{flexDirection: 'row'}}>
                                        <View style={styles.leftCol}>
                                            <Details icon='camera' title='Camera Make' value={this.state.photo.exif.make}/>
                                            <Details icon='crop-free' title='Size' value={this.state.photo.width + 'x' + this.state.photo.height}/>
                                            <Details icon='camera-iris' title='Aperture' value={this.state.photo.exif.aperture}/>
                                            <Details icon='lightbulb-on' title='ISO' value={this.state.photo.exif.iso}/>
                                        </View>
                                        <View style={styles.rightCol}>
                                            <Details icon='film' title='Model' value={this.state.photo.exif.model}/>
                                            <Details icon='code-tags' title='Focal Length' value={this.state.photo.exif.focal_length}/>
                                            <Details icon='white-balance-sunny' title='Exposure' value={this.state.photo.exif.exposure}/>
                                            <Details icon='palette' title='Color Palette' value={this.state.photo.color}/>
                                        </View>
                                    </View>
                                </View>
                                :
                                <View style={{ marginTop: 30 }}>
                                    <ActivityIndicator size="large" color="#fff" />
                                </View>
                            }
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    userContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    scrollView: {
        alignSelf: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    linearGradient: {
        width: '100%',
        paddingBottom: 10,
        marginTop: 1,
    },
    avatar: {
        alignSelf: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        marginTop: 10,
        textAlign: 'center',
        color: 'white',
        fontWeight: '700',
        fontSize: 13
    },
    userLocation: {
        textAlign: 'center',
        color: '#aaa',
        fontSize: 11,
        marginTop: 2,
    },
    imageDetailsContainer: {
        alignSelf: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: Dimensions.get('window').width,
        backgroundColor: 'white',
        paddingBottom: 15,
    },
    leftCol: {
        width: '50%',
        alignItems: 'center'
    },
    rightCol: {
        width: '50%',
        alignItems: 'center'
    },
    infoContainer:{
        flexDirection: 'row',
    },
    actionContainer: {
        marginTop: 20,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
    },
    action: {
        width: 100,
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    actionText: {
        marginTop: 10,
        textAlign: 'center',
        color: 'black',
        fontSize: 11,
        fontFamily: 'SpaceMono-Regular',
    },
    actionIcon:{
        alignSelf: 'center',
    }
});
