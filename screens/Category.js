import React, { Component, PureComponent } from 'react';
import {
    Alert,
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    View,
    LayoutAnimation,
    UIManager,
    FlatList,
    ScrollView,
    Dimensions,
    ImageBackground,
    ActivityIndicator,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { StackActions } from 'react-navigation';
import CustomImage from '../components/CustomImage'
import VectorIcon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import ScalableImage from 'react-native-scalable-image';

import withPreventDoubleClick from '../withPreventDoubleClick';
const TouchableOpacityEx = withPreventDoubleClick(TouchableOpacity);
const CLIENT_ID = 'client_id=7a2ce295655ad90de5c9e0b7f61379c3f66596a0e7a9c1145565ef50b4c056fa';
const API_ENDPOINT = 'https://api.unsplash.com/';
const PAGE_SIZE = 'per_page=50'
const windowWidth = Dimensions.get('window').width

class GridImage extends PureComponent {

    render() {
        const { item } = this.props;
        return (
            <CustomImage
                columns={2.08}
                resize={true}
                style={styles.gridImage}
                originalWidth={item.width}
                originalHeight={item.height}
                source={item.urls.small} />
        );
    }
}

export default class Category extends React.Component {

    static navigationOptions = {
        headerTransparent: true,
        headerTintColor: '#000',
        headerStyle: {
            marginTop: 24,
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            user: null,
            scrollUpdated: false,
            isListLayout: true,
            scrollDirection: 'up',
            scrollOffset: 0,
            opacity: new Animated.Value(0),
            query: '',
            page: 1,
            totalPages: 10,
            loading: false
        }
    }

    async componentDidMount() {
        this.getPhotos()
        this.setState({
            isListLayout: this.props.screenProps.isListLayout
        });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.screenProps.query && nextProps.screenProps.query != this.state.query){
            this.searchPhotos(nextProps.screenProps.query);
        }
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        this.setState({
            isListLayout: nextProps.screenProps.isListLayout
        });
    } 
    
    componentWillUnmount() {
        this.props.navigation.state.params.onNavigateBack ? this.props.navigation.state.params.onNavigateBack() : null
    }
    
    /* network requests */
    getPhotos() {
        this.setState({
            loading: true
        })
        if(this.state.page == this.state.totalPages){
        } else {
            let details = this.props.navigation.getParam('categoryDetails', {});
            let request = `${API_ENDPOINT}search/photos?page=${this.state.page};query=${details.title};${CLIENT_ID}`
            return fetch(request)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    totalPages: responseJson.total_pages,
                    photos: this.state.page == 1 ? responseJson.results : [...this.state.photos, ...responseJson.results]
                }, () => {        
                    this.setState({
                        loading: false
                    })
                })
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    /* handle user interaction */
    handleScroll = (event) => {
        var currScrollOffset = event.nativeEvent.contentOffset.y;
        let direction = '';
        if (currScrollOffset <= 0) {
            direction = 'up';
        } else if (currScrollOffset > this.state.scrollOffset) {
            direction = 'down'
        } else {
            direction = 'up'
        }
        let animateValue = direction == 'down' ? 0 : 1;
        if (direction != this.state.scrollDirection) {
            this.props.screenProps.updateIsScrolling(direction);
            Animated.timing(this.state.opacity, {
                toValue: animateValue,
                duration: 500,
                useNativeDriver: true
            }).start();
            this.setState({
                scrollDirection: direction
            })
        }
        this.setState({
            scrollOffset: currScrollOffset
        })
    }

    handleLoadMore = () => {
        if (!this.state.loading) {
            this.setState({
                page: this.state.page + 1
            }, () => {
                this.getPhotos()
            })
        }
    }

    /* navigate screens */
    pushToImageDetails = (details) => {
        let pushAction = StackActions.push({
            routeName: 'ImageDetails', 
            params: {
                imageDetails: details,
                onNavigateBack: this.handleOnNavigateBack
            }
        });
        this.props.navigation.dispatch(pushAction);
    }

    handleOnNavigateBack = () => {
        this.props.screenProps.updateIsScrolling('up')
    }

    render() {
        const categoryDetails = this.props.navigation.getParam('categoryDetails', {})
        if (this.state.photos.length > 0) {
            var firstColumn = [];
            var secondColumn = [];
            for (let i = 0; i < this.state.photos.length; i += 2) {
                firstColumn.push(
                    <TouchableOpacityEx
                    activeOpacity={1}
                    onPress={() => this.pushToImageDetails(this.state.photos[i])}>
                        <GridImage 
                        key={i} 
                        item={this.state.photos[i]} />
                    </TouchableOpacityEx>
                );
                this.state.photos[i+1] ? 
                secondColumn.push(
                    <TouchableOpacityEx
                        activeOpacity={1}
                        onPress={() => this.pushToImageDetails(this.state.photos[i+1])}>
                        <GridImage 
                            key={i+1} 
                            item={this.state.photos[i+1]} />
                    </TouchableOpacityEx>
                ) : null;
            }
            return (
                <View style={this.state.isListLayout ? styles.mainContainerList : styles.mainContainerGrid}>
                    {
                        this.state.isListLayout == false ?
                            <Animated.ScrollView
                            scrollEventThrottle={16}
                            onScroll={this.handleLoadMore}
                            showsVerticalScrollIndicator={false} 
                            ref="scrollView">
                            <StatusBar barStyle={(this.state.scrollDirection == 'down' && this.state.isListLayout) ? 'light-content' : 'dark-content'} backgroundColor={(this.state.scrollDirection == 'down' && this.state.isListLayout) ? 'rgba(0,0,0,0.5)' : '#fff'} translucent={true} />
                                <ScrollView
                                    style={{paddingTop: 75}}
                                    contentContainerStyle={styles.contentContainerStyle}
                                    showsVerticalScrollIndicator={false}>
                                    <View style={[styles.imageContainer, { width: windowWidth / 2 }]}>
                                        {firstColumn}
                                    </View>
                                    <View style={[styles.imageContainer, { width: windowWidth / 2 }]}>
                                        {secondColumn}
                                    </View>
                                </ScrollView>
                            </Animated.ScrollView> :
                            <View style={styles.scrollContainer}>
                            <StatusBar barStyle='dark-content' backgroundColor={'rgba(0,0,0,0)'} translucent={true} />
                            <FlatList
                                onEndReached={this.handleLoadMore}
                                onEndReachedThreshold={10}
                                showsVerticalScrollIndicator={false}
                                data={this.state.photos}
                                onScroll={this.handleScroll}
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
                    }
                    {
                        this.state.loading ? 
                        <View style={{position: 'absolute', zIndex: 10, bottom: 0, width: '100%', height: 70, justifyContent: 'center', paddingVertical: 20 }}>
                            <ActivityIndicator size="large" color="#000" />
                        </View> : null
                    }
                </View>
            );
        }
        else {
            return (
                <View>
                    <ActivityIndicator style={{marginTop: Dimensions.get('window').height /2}} size="large" color="#333" />
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    mainContainerGrid: {
        flex: 1,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        // marginTop: 10,
    },
    mainContainerList: {
        flex: 1,
        backgroundColor: '#fff',
        // marginTop: 10,
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
    image: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
    },
    gridImage: {
        margin: 6,
        // borderRadius: 6
    },
    listImage: {
        margin: 0,
        borderRadius: 0,
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
    },
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
        fontFamily: 'SpaceMono-Regular',
        color: '#555',
        fontSize: 14,
        textAlign: 'center'
    },
});
