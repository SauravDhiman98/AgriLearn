import { View, Text, TouchableOpacity } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { useNavigation } from '@react-navigation/native'

export default function ProfileScreen() {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigation = useNavigation<any>()
  return (
    <View style={{flex:1,padding:20,backgroundColor:'#f9fafb'}}>
      {isAuthenticated ? (
        <>
          <Text style={{fontSize:22,fontWeight:'bold',marginBottom:4}}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={{color:'#6b7280',marginBottom:24}}>{user?.email}</Text>
          <Text style={{color:'#6b7280',marginBottom:24}}>Role: {user?.role}</Text>
          <TouchableOpacity
            onPress={() => dispatch(logout())}
            style={{backgroundColor:'#dc2626',padding:14,borderRadius:10,alignItems:'center'}}>
            <Text style={{color:'#fff',fontWeight:'bold'}}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{alignItems:'center',paddingTop:40}}>
          <Text style={{fontSize:18,fontWeight:'600',marginBottom:16}}>Please login to continue</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{backgroundColor:'#16a34a',padding:14,borderRadius:10,paddingHorizontal:40}}>
            <Text style={{color:'#fff',fontWeight:'bold'}}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
