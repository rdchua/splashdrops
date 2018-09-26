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
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
    AsyncStorage
} from 'react-native';
import { StackActions } from 'react-navigation';
import Image from 'react-native-scalable-image';
import CustomImage from '../components/CustomImage'
import VectorIcon from 'react-native-vector-icons/Feather';

const CLIENT_ID = 'client_id=7a2ce295655ad90de5c9e0b7f61379c3f66596a0e7a9c1145565ef50b4c056fa';
const API_ENDPOINT = 'https://api.unsplash.com/';
const PAGE_SIZE = 'per_page=20'
const windowWidth = Dimensions.get('window').width
var link_parser = require('parse-link-header');
import withPreventDoubleClick from '../withPreventDoubleClick';
const TouchableOpacityEx = withPreventDoubleClick(TouchableOpacity);

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

class ListImage extends PureComponent {
    render() {
        const {item} = this.props;
        return (
            <Image
                isCollection={false}
                data={item}
                background={true}
                width={Dimensions.get('window').width}
                source={{ uri: item.urls.small }}
            />
        )
    }
}

export default class Home extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            user: null,
            scrollUpdated: false,
            isListLayout: false,
            scrollDirection: 'up',
            scrollOffset: 0,
            opacity: new Animated.Value(0),
            query: '',
            page: 1,
            lastPage: 100,
            loading: false,
            refreshing: false
        }
    }

    componentDidMount() {
        console.log('mounting')
        this.getPhotos();
        this.setState({
            scrollDirection: 'up',
            isListLayout: this.props.screenProps.isListLayout
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.screenProps.query && nextProps.screenProps.query != this.state.query) {
            this.searchPhotos(nextProps.screenProps.query);
        }
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.linear);
        this.setState({
            isListLayout: nextProps.screenProps.isListLayout
        });
    }

    /* network requests */
    getPhotos = () => {
        AsyncStorage.getItem('likes')
            .then(req => this.setState({photos: JSON.parse(req)}))
            .catch(error => console.log('error!'));
    }

    handleScroll = (event) => {
        var currScrollOffset = event.nativeEvent.contentOffset.y;
        if(!this.state.isListLayout && (event.nativeEvent.layoutMeasurement.height + currScrollOffset >= event.nativeEvent.contentSize.height - 50)){
            this.handleLoadMore()
        }
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
            this.state.lastPage ? this.setState({
                page: this.state.page + 1
            }, () => {this.state.query != '' ? this.searchPhotos(this.state.query) : this.getPhotos()}) : null
        }
    }

    /* navigate screens */
    pushToImageDetails = (details) => {
        if (this.props.screenProps.updateIsScrolling) {
            this.props.screenProps.updateIsScrolling('down');
        }
        let pushAction = StackActions.push({
            routeName: 'ImageDetails',
            params: {
                imageDetails: details,
                onNavigateBack: this.handleOnNavigateBack
            }
        });
        this.props.navigation.dispatch(pushAction);
    }

    handleMasonryScroll(event){
        var currScrollOffset = event.nativeEvent.contentOffset.y;
        if(!this.state.isListLayout && (event.nativeEvent.layoutMeasurement.height + currScrollOffset >= event.nativeEvent.contentSize.height - 50)){
            this.handleLoadMore()
        }
        Animated.event(
            [{nativeEvent: {contentOffset: {y: this.props.screenProps.scrollY}}}],
            {onScroll: this.props.onScroll},
            { listener: this.props.screenProps.updateIsScrolling})(event);
    }


    handleOnNavigateBack = () => {
        this.props.screenProps.updateIsScrolling('up')
    }

    render() {
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
                        !this.props.screenProps.user ?
                            <Animated.View style={[styles.searchContainer, { opacity: this.state.opacity }]}>
                                <TouchableOpacity style={styles.searchButton} onPress={this.handlePress}>
                                    <VectorIcon style={styles.searchIcon} name="search" size={20} color="rgba(0,0,0,.9)" />
                                </TouchableOpacity>
                                <TextInput
                                    ref={(input) => { this.secondTextInput = input; }}
                                    style={styles.floatingSearchInput}
                                    onSubmitEditing={(event) => {
                                        this.searchPhotos(event.nativeEvent.text);
                                    }}
                                    placeholder='Search..'
                                    placeholderTextColor='#888'
                                    onChangeText={(text) => this.setState({ query: text })}
                                    underlineColorAndroid={'transparent'}
                                />
                            </Animated.View> : null
                    }
                    <StatusBar barStyle={(this.state.scrollDirection == 'down' && this.state.isListLayout) ? 'light-content' : 'dark-content'} backgroundColor={(this.state.scrollDirection == 'down' && this.state.isListLayout) ? 'rgba(0,0,0,0.5)' : '#fff'} translucent={true} /> 
                    {
                        this.state.isListLayout == false ?
                            //* Layout for masonry (staggered grid) list
                            <View>
                                <Animated.ScrollView
                                    removeClippedSubviews={true}
                                    contentContainerStyle={styles.contentContainerStyle}
                                    showsVerticalScrollIndicator={false}
                                    ref='masonryView'
                                    onScroll = {
                                        !this.props.screenProps.scrollY ?
                                        this.handleScroll : this.handleMasonryScroll.bind(this)
                                    }>
                                    <View style={[styles.imageContainer, {paddingTop: this.props.screenProps.user ? this.props.screenProps.scrollViewHeight + 30 : 74}]}>
                                        {firstColumn}
                                    </View>
                                    <View style={[styles.imageContainer, {paddingTop: this.props.screenProps.user ? this.props.screenProps.scrollViewHeight + 30 : 74}]}>
                                        {secondColumn}
                                    </View>
                                </Animated.ScrollView> 
                            </View> :
                            //* Layout for list view (full width images)
                            <FlatList
                                style={{ paddingTop: this.props.screenProps.user ? this.props.screenProps.scrollViewHeight + 30 : 74 }}
                                ref="scrollView"
                                removeClippedSubviews={true}
                                showsVerticalScrollIndicator={false}
                                data={this.state.photos}
                                onScroll={
                                    !this.props.screenProps.scrollY ?
                                        this.handleScroll : 
                                        Animated.event([{nativeEvent: {contentOffset: {
                                            y: this.props.screenProps.scrollY}}
                                        }], { listener: this.props.screenProps.updateIsScrolling})
                                }
                                onEndReached={this.handleLoadMore}
                                onEndReachedThreshold={10}
                                keyExtractor={(item, index) => item.id.toString()}
                                renderItem={({ item, index }) =>
                                    <TouchableOpacityEx
                                        activeOpacity={1}
                                        onPress={() => {
                                            this.pushToImageDetails(item)
                                        }}>
                                        <ListImage
                                            item={item}
                                        />
                                    </TouchableOpacityEx>
                                }
                            />
                    }
                    {
                        this.state.loading ? 
                        <View style={{position: 'absolute', zIndex: 10, bottom: 0, width: '100%', height: 70, justifyContent: 'center', paddingVertical: this.props.screenProps.user ? 50 : 20 }}>
                            <ActivityIndicator size="large" color="#000" />
                        </View> : null
                    }
                </View>
            );
        }
        else {
            return (
                <View>
                    <ActivityIndicator style={{ marginTop: Dimensions.get('window').height / 2 }} size="large" color="#333" />
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
        width: windowWidth / 2,
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
    }
});
