import React, {Component} from 'react';
import {Animated, Easing, LayoutAnimation, Alert} from 'react-native';
import ScrollableTabView, {ScrollableTabBar, } from 'react-native-scrollable-tab-view';
import { createStackNavigator} from 'react-navigation';
//screens
import HomeScreen from './screens/Home'
import CollectionsScreen from './screens/Collections'
import DiscoverScreen from './screens/Discover'
import ImageDetailScreen from './screens/ImageDetails'
import CollectionDetailsScreen from './screens/CollectionDetails'
import ProfileScreen from './screens/Profile'
import CategoryScreen from './screens/Category'
import LikesScreen from './screens/Likes'

export default class App extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isScrolling: false,
            isListLayout: false,
            tabBarPosition: new Animated.Value(0),
            query: ''
        }
    }

    setQuery = (text) => {
        this.setState({
            query: text
        });
    }

    updateIsScrolling = (direction) => {
        let value = direction == 'down' ? 1 : 0 
        Animated.timing(this.state.tabBarPosition, {
            toValue: value,
            duration: 200,
            useNativeDriver: true
        }).start();
    }

    updateLayout = (value) => {
        this.setState({
            isListLayout: value
        })
    }

    render() {
        const { navigation } = this.props;
        const translateY = this.state.tabBarPosition.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -74]
        })
        const transform = [{translateY}]
        return (
            <ScrollableTabView 
                locked={true}
                tabBarBackgroundColor='#fff'
                tabBarActiveTextColor='black'
                tabBarInactiveTextColor='#aaa'
                tabBarTextStyle={{ fontSize: 12, fontFamily: 'Metropolis-Light', fontWeight: '1000', letterSpacing: 1.2 }}
                tabBarUnderlineStyle={{ backgroundColor: 'transparent'}}
                renderTabBar={() => <ScrollableTabBar
                    tabStyle={{marginTop: 24}}
                    isScrolling={this.state.isScrolling}
                    tabBarActiveTextStyle={{fontFamily: 'Metropolis-Bold', fontWeight: '1000', }}
                    updateLayout={this.updateLayout.bind(this)}
                    activeBackgroundColor="#ffffff"
                    style={{ transform, elevation: 0}}/>}>
                <HomeStack 
                tabLabel="FEATURED" 
                navigation={navigation}
                screenProps={{
                    tabLabel: 'FEATURED',
                    query: this.state.query,
                    isListLayout: this.state.isListLayout,
                    setQuery: this.setQuery.bind(this),
                    updateIsScrolling: this.updateIsScrolling.bind(this),
                }} />
                <CollectionStack 
                tabLabel="COLLECTIONS"
                navigation={navigation} 
                screenProps={{
                    query: this.state.query,
                    isListLayout: this.state.isListLayout,
                    setQuery: this.setQuery.bind(this),
                    updateIsScrolling: this.updateIsScrolling.bind(this),
                }}/>
                <DiscoverStack 
                tabLabel="DISCOVER"  
                navigation={navigation}
                screenProps={{
                    isListLayout: this.state.isListLayout,
                    updateIsScrolling: this.updateIsScrolling.bind(this),
                }}/>
                {/* <LikesStack 
                tabLabel="LIKES" 
                navigation={navigation}
                screenProps={{
                    tabLabel: 'LIKES',
                    query: this.state.query,
                    isListLayout: this.state.isListLayout,
                    setQuery: this.setQuery.bind(this),
                    updateIsScrolling: this.updateIsScrolling.bind(this),
                }} /> */}
            </ScrollableTabView>
        );
    }
}

const HomeStack = createStackNavigator({
    Home: { screen: HomeScreen },
    ImageDetails: { screen: ImageDetailScreen },
    Profile: {screen: ProfileScreen},
    CollectionDetails: {screen: CollectionDetailsScreen }
}, {
    navigationOptions: {
        gesturesEnabled: true,
    },
});

const CollectionStack = createStackNavigator({
    Collection: { screen: CollectionsScreen },
    ImageDetails: { screen: ImageDetailScreen },
    CollectionDetails: {screen: CollectionDetailsScreen },
    Profile: {screen: ProfileScreen},
}, {
    navigationOptions: {
        gesturesEnabled: true,
    },
});

const DiscoverStack = createStackNavigator({
    Discover: { screen: DiscoverScreen },
    Category: {screen: CategoryScreen },
    ImageDetails: { screen: ImageDetailScreen },
    Profile: {screen: ProfileScreen},
}, {
    navigationOptions: {
        gesturesEnabled: true,
    },
});

const LikesStack = createStackNavigator({
    Likes: { screen: LikesScreen },
    ImageDetails: { screen: ImageDetailScreen },
    Profile: {screen: ProfileScreen},
    CollectionDetails: {screen: CollectionDetailsScreen }
}, {
    navigationOptions: {
        gesturesEnabled: true,
    },
});

