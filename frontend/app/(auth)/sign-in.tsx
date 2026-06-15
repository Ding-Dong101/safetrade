import {View,Text} from 'react-native'
import {Link} from 'expo-router'
const SignIn =() =>{
    return(
        <View>
            <Text>SignIn </Text>
            <Link href="/(auth)/sign-up"> Sign In</Link>
        </View>
    )
}
export default SignIn;