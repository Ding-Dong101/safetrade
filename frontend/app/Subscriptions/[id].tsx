import{View , Text} from 'react-native';
import {useLocalSearchParams,Link} from "expo-router";
//import React  from 'react'

const SubscriptionDetails =  () => {
    const {id}= useLocalSearchParams<{id: string}>()
    return(
        <View>
            <Text>Subscription Details:{id}</Text>
            <Link href="/">Go back </Link>
        </View>
    )
}

export default SubscriptionDetails