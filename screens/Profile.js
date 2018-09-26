import React, {Component} from 'react';
import {Animated, StyleSheet, Image, View, Text, Alert} from 'react-native';
import ScrollableTabView, {ProfileTabBar, } from 'react-native-scrollable-tab-view';
import { createStackNavigator} from 'react-navigation';
//screens
// import UserPhotosScreen from '../screens/'
import HomeScreen from '../screens/Home'
import CollectionsScreen from '../screens/Collections'
import DiscoverScreen from '../screens/Discover'
import ImageDetailScreen from '../screens/ImageDetails'

export default class App extends React.Component {

    static navigationOptions = {
        headerTransparent: true,
        headerTintColor: 'rgba(0,0,0,1)',
        headerStyle: {
            paddingTop: 20
        }
    };
    
    constructor(props) {
        super(props);
        this.state = {
            isScrolling: false,
            isListLayout: false,
            scrollY: new Animated.Value(0),
            opacity: new Animated.Value(0),
            query: '',
            height: 0,
        }
    }

    setQuery = (text) => {
        this.setState({
            query: text
        });
    }

    updateHeight = (height) => {
        this.setState({
            height: height
        })
    }

    updateIsScrolling = (event) => {
        Animated.event([
            { nativeEvent: { contentOffset: { y: this.state.scrollY }}}
        ],{useNativeDriver: true});
    }

    updateLayout = (value) => {
        this.setState({
            isListLayout: value
        })
    }

    render() {
        const { navigation } = this.props;
        const translateY = this.state.scrollY.interpolate({
            inputRange: [0, (this.state.height)],
            outputRange: [0, -(this.state.height-90)],
            extrapolate: 'clamp'
        })
        const scrollOpacity = this.state.scrollY.interpolate({
            inputRange: [0, (this.state.height)],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        })
        const transform = [{translateY}]
        const userDetails = navigation.getParam('userDetails', {});
        return (
                <ScrollableTabView 
                    tabBarBackgroundColor='#fff'
                    tabBarActiveTextColor='black'
                    tabBarInactiveTextColor='#ddd'
                    tabBarTextStyle={{ fontSize: 12, fontFamily: 'Metropolis-Light', fontWeight: '1000', letterSpacing: 1.2 }}
                    tabBarUnderlineStyle={{ backgroundColor: 'transparent'}}
                    renderTabBar={() => <ProfileTabBar
                        updateHeight={this.updateHeight.bind(this)}
                        data={userDetails}
                        tabStyle={{marginTop: 24, paddingBottom: 10}}
                        isScrolling={this.state.isScrolling}
                        tabBarActiveTextStyle={{fontFamily: 'Metropolis-Bold', fontWeight: '1000', }}
                        updateLayout={this.updateLayout.bind(this)}
                        activeBackgroundColor="#ffffff"
                        userContainerStyle={{opacity: scrollOpacity}}
                        style={{ transform, elevation: 3 }} />}>
                    <HomeScreen 
                    tabLabel={userDetails.total_photos + ' PHOTOS'} 
                    navigation={navigation}
                    screenProps={{
                        user: userDetails,
                        tabLabel: 'photos',
                        scrollViewHeight: this.state.height,
                        isListLayout: this.state.isListLayout,
                        scrollY: this.state.scrollY,
                        updateIsScrolling: this.updateIsScrolling.bind(this),
                    }} />
                    <CollectionsScreen 
                    navigation={navigation}
                    tabLabel={userDetails.total_collections + ' COLLECTIONS'}
                    screenProps={{
                        user: userDetails, 
                        tabLabel: 'collections',
                        scrollViewHeight: this.state.height,
                        isListLayout: this.state.isListLayout,
                        scrollY: this.state.scrollY,
                        updateIsScrolling:this.updateIsScrolling.bind(this),
                    }}/>
                    <HomeScreen 
                    navigation={navigation}
                    tabLabel={userDetails.total_likes + ' LIKES'} 
                    screenProps={{
                        user: userDetails,
                        tabLabel: 'likes',
                        scrollViewHeight: this.state.height,
                        isListLayout: this.state.isListLayout,
                        scrollY: this.state.scrollY,
                        updateIsScrolling: this.updateIsScrolling.bind(this),
                    }}/>
                </ScrollableTabView>
        );
    }
}

const HomeStack = createStackNavigator({
    Home: { screen: HomeScreen },
    // UserCollections: { screen: UserCollectionsScreen },
    // UserLikes: { screen: UserLikesScreen },
}, {
    navigationOptions: {
        gesturesEnabled: true,
    },
});

const styles = StyleSheet.create({
    userContainer: {
        height: 100,
        backgroundColor: 'white',
        padding: 20
    }
})