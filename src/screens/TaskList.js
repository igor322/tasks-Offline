import React, { Component} from 'react'
import {View,
    Text,
    ImageBackground,
    StyleSheet, 
    FlatList,
    TouchableOpacity,
    Platform,
    Alert
} from 'react-native'
import asyncStorage from '@react-native-community/async-storage'
import Icon from 'react-native-vector-icons/FontAwesome'
import moment from "moment"
import 'moment/locale/pt-br'

import commonStyles from '../commonStyles'
import todayImage from '../../assets/imgs/today.jpg'
import Task from '../components/Task'
import AddTask from './addTask'

const initialState = {
    showDoneTasks: true,
    showAddTask: false,
    visibleTasks: [],
    tasks:[]
}

export default class TaksList extends Component {

    state = { ...initialState }

    componentDidMount = async () => {
        const stateString = await asyncStorage.getItem('tasksState')
        const state = JSON.parse(stateString)  || initialState
        this.setState(state, this.filterTask) 
    }

    toggleFilter = () => {
        this.setState({ showDoneTasks: !this.state.showDoneTasks }, this.filterTask)
    }

    filterTask = () => {
        let visibleTasks = null
        if(this.state.showDoneTasks){
            visibleTasks = [...this.state.tasks]
        } else {
            const pending = task => task.doneAt === null
            visibleTasks = this.state.tasks.filter(pending)
        }

        this.setState({ visibleTasks})
        asyncStorage.setItem('tasksState', JSON.stringify(this.state))
    }

    toggleTasks = taskId => {
        const tasks = [...this.state.tasks]
        tasks.forEach(task => {
            if(task.id == taskId){
                task.doneAt = task.doneAt ? null : new Date()
            }
        })
        this.setState({tasks : tasks }, this.filterTask)
    }

    addTask = newTask => {
        if(!newTask.desc || !newTask.desc.trim()) {
            Alert.alert('Dados inválidos!', 'Descrição não informada.')
            return 
        }
        
        const tasks = [...this.state.tasks]
        tasks.push({
            id: Math.random(),
            desc: newTask.desc,
            estimateAt: newTask.date,
            doneAt: null
        })

        this.setState({tasks, showAddTask: false}, this.filterTask)
    }

    deleteTask = id => {
        const tasks = this.state.tasks.filter(task => task.id !== id)
        this.setState({tasks}, this.filterTask)
    }

    render () {
        const today = moment().locale('pt-br').format('ddd, D [de] MMMM')
        return (
            <View style={styles.container}>
                <AddTask isVisible={this.state.showAddTask}
                onCancel={() => this.setState({ showAddTask: false})}
                onSave={this.addTask}/>
                <ImageBackground
                source={todayImage}
                style={styles.background}>
                    <View style={styles.iconBar}>
                        <TouchableOpacity onPress={this.toggleFilter}>
                            <Icon name={this.state.showDoneTasks ? 'eye' : 'eye-slash'} size={20} color={commonStyles.colors.secundary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.titleBar}>
                        <Text style={styles.title}>Hoje</Text>
                        <Text style={styles.subTitle}>{today}</Text>
                    </View>
                </ImageBackground>

                <View style={styles.taskList}>
                    <FlatList data={this.state.visibleTasks}
                    keyExtractor={item => `${item.id}`}
                    renderItem={({item}) => <Task {...item} onToggleTasks={this.toggleTasks} onDelete={this.deleteTask}/>}/>
                </View>
                <TouchableOpacity style={styles.addButton}
                activeOpacity={0.7}
                onPress={() => this.setState({ showAddTask: true})}>
                    <Icon name='plus' size={20} color={commonStyles.colors.secundary}/>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles =StyleSheet.create({
    container:{
        flex: 1,

    },
    background:{
        flex:3
    },
    taskList:{
        flex:7
    },
    titleBar:{
        flex:1,
        justifyContent:'flex-end',
    },
    title:{
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secundary,
        fontSize: 50,
        marginLeft: 20,
        marginBottom: 20
    },
    subTitle:{
        fontFamily: commonStyles.fontFamily,
        color: commonStyles.colors.secundary,
        fontSize: 20,
        marginLeft: 20,
        marginBottom: 20
    },
    iconBar:{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginHorizontal: 20,
        marginTop: Platform.ios ? 40 : 10
    },
    addButton:{
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: commonStyles.colors.today,
        justifyContent: 'center',
        alignItems: 'center'
    }
})