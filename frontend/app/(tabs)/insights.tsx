import{View , Text} from 'react-native';
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
const SafeAreaView = styled(RNSafeAreaView);

//import React  from 'react'

const Insights =  () => {
    return(
        <SafeAreaView>
            <Text>Insights</Text>
        </SafeAreaView>
    )
}

export default Insights