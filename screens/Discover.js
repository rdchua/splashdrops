import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Dimensions,
    FlatList,
    Animated,
    Text,
    ScrollView,
    UIManager,
    TouchableWithoutFeedback,
    TouchableOpacity,
    Image,
} from 'react-native';
import CustomImage from '../components/CustomImageCollection'
// import Image from 'react-native-scalable-image';
import { StackActions } from 'react-navigation';
import VectorIcon from 'react-native-vector-icons/Feather';

const CLIENT_ID = 'client_id=7a2ce295655ad90de5c9e0b7f61379c3f66596a0e7a9c1145565ef50b4c056fa';
const API_ENDPOINT = 'https://api.unsplash.com/';

const windowWidth = Dimensions.get('window').width

export default class Discover extends React.Component {

    constructor() {
        super();
        this.state = {
            photos: [],
            scrollUpdated: false,
            isListLayout: false,
            scrollDirection: 'up',
            scrollOffset: 0,
            categories: [
                {title: 'Nature', source: 'https://source.unsplash.com/featured/?nature'},
                {title: 'Food', source: 'https://source.unsplash.com/featured/?food,drinks'},
                {title: 'Architecture', source: 'https://source.unsplash.com/featured/?architecture'},
                {title: 'Minimal', source: 'https://source.unsplash.com/featured/?minimal'},
                {title: 'Plants', source: 'https://source.unsplash.com/featured/?plants'},
                {title: 'Animals', source: 'https://source.unsplash.com/featured/?animals'},
                {title: 'City', source: 'https://source.unsplash.com/featured/?city'},
                {title: 'Beach', source: 'https://source.unsplash.com/featured/?beach'},
                {title: 'Mountain', source: 'https://source.unsplash.com/featured/?mountain'},
                {title: 'Black and White', source: 'https://source.unsplash.com/featured/?black and white'},
            ],
        }
    }

    async componentDidMount(){
        this.setState({
            scrollDirection: 'up',
            photos: await this.getFeaturedCollection(),
            isListLayout: this.props.isListLayout
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.query && nextProps.query != this.state.query) {
            this.searchPhotos(nextProps.query);
        }
        this.setState({
            isListLayout: nextProps.isListLayout
        });
    }

    getFeaturedCollection(query) {
        let request;
        if(query){
            request = API_ENDPOINT + 'search/collections?query=' + query + ';per_page=50;' + CLIENT_ID;
        } else {
            request = API_ENDPOINT + 'collections?per_page=50;' + CLIENT_ID
        }
        return fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {
                if(query){
                    return responseJson.results;    
                } else {
                    return responseJson;
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }

    searchPhotos = async (text) => {
        this.setState({
            query: text,
            photos: await this.getFeaturedCollection(text)
        })
        this.props.setQuery(text);
    }

    handlePress = (event) => {
        Animated.timing(this.state.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true
            }).start();
        this.state.isListLayout ? this.refs.scrollView.scrollToOffset({ y: 0, animated: true }) : this.refs.scrollView.scrollTo(0);
    }

    handleScroll = (event) => {
        var currScrollOffset = event.nativeEvent.contentOffset.y;
        let direction = currScrollOffset > this.state.scrollOffset ? 'down' : 'up';
        let animateValue = 0;
        if (currScrollOffset == 0 || direction == 'down') {
            animateValue = 0;
        } else {
            animateValue = 1;
        }
        if (direction != this.state.scrollDirection) {
            Animated.timing(this.state.opacity, {
                toValue: animateValue,
                duration: 500,
                // delay: index * 100,
                useNativeDriver: true
            }).start();
        }
        this.setState({
            scrollDirection: direction,
            scrollOffset: currScrollOffset
        })
    }

    /* navigation functions */
    pushToCategory = (details) => {
        let pushAction = StackActions.push({
            routeName: 'Category',
            params: {
                categoryDetails: details,
                onNavigateBack: this.handleOnNavigateBack
            }
        });
        this.props.navigation.dispatch(pushAction);
    }

    handleOnNavigateBack = () => {
        this.props.screenProps.updateIsScrolling('up')
    }
    
    render() {
        return(
            <View style={styles.mainContainerList}>
                <FlatList
                    style={{marginTop: 15, paddingBottom: 20}}
                    showsVerticalScrollIndicator={false}
                    contentInset={{ bottom: 16 }}
                    data={this.state.categories}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) =>
                    <TouchableOpacity
                    style={{backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 15, width: windowWidth}}
                    activeOpacity={1}
                    onPress={() => {
                        if (this.props.screenProps.updateIsScrolling) {
                            this.props.screenProps.updateIsScrolling('down');
                        }
                        this.pushToCategory(item)
                    }}>
                        <Image
                            borderRadius={3}
                            style={{width: '100%', height: 100}}
                            source={{uri: item.source}}/>
                            <View style={styles.overlay}>
                                <Text style={{fontFamily: 'Metropolis-Bold', color: 'white', letterSpacing: 2}}>{item.title.toUpperCase()}</Text>
                            </View>
                    </TouchableOpacity>}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainerList: {
        flex: 1,
    },
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.3)', 
        position: 'absolute', 
        padding: 20,
        top: 8, 
        left: 15, 
        height: 100, 
        width: '100%', 
        borderRadius: 3
    },
    searchInput: {
        flex: 1,
        color: '#000',
        height: 45,
        fontWeight: '700',
        fontSize: 16, 
    },
    searchIcon: {
        padding: 10,
    },
    listImage: {
        borderRadius: 0,
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
    imageContainerList: {
        flex: 1,
    },
    searchInputContainer: {
        elevation: 4,
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 25,
        paddingTop: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    actionContainerStyle: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 10,
        right: 15
    },
    
    floatingSearchInput: {
        flex: 1,
        color: '#000',
        height: 40,
        marginTop: 2,
        fontFamily: 'Metropolis-Light',
        letterSpacing: 1.2,
        fontSize: 13,
    },
    searchInput: {
        flex: 1,
        color: '#000',
        height: 40,
        fontFamily: 'Metropolis-Light',
        letterSpacing: 1.2,
        width: '100%',
        textAlign: 'center',
        fontSize: 13,
    },
    searchContainer: {
        flexDirection: 'row',
        zIndex: 100,
        position: 'absolute',
        width: 200,
        bottom: 20,
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        elevation: 5,
        borderRadius: 50
        // backgroundColor: 'rgba(255,255,255,0.9)',
    },
    searchButton: {
        height: 40,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    searchIcon: {
        paddingLeft: 5
    }
});
