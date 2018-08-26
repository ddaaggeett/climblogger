import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Linking } from 'react-native';
import * as actions from '../actions'
import { styles } from '../styles'
import QRCodeScanner from 'react-native-qrcode-scanner'
import rnConfig from '../../config/rnConfig' // TODO: use a single source for configs
import io from 'socket.io-client/dist/socket.io'
const socket = io.connect('http://' + rnConfig.serverIP + ':' + rnConfig.socketPort)

export default class QRScanner extends Component {
    constructor(props) {
        super(props)
    }

    findUserWallIndex(wall) {
        const walls = this.props.user.walls
        for(var x = 0; x < walls.length; x++) {
            if (walls[x].id == wall) return x
            else if((x == walls.length - 1) && (walls[x].id != wall)) {
                return null
            }
        }
    }

    onSuccess(e) {
        const wallID = e.data
        var newUserInst = {}
        if(this.props.user.walls.length == 0) { // first wall
            newUserInst = {
                ...this.props.user,
                walls: [
                    {
                        id: wallID,
                        succeeded: false,
                    }
                ],
            }
        }
        else { // not first wall
            const userWallIndex = this.findUserWallIndex(wallID)
            if(userWallIndex == null) { // wall doesn't exist yet - add to front
                newUserInst = {
                    ...this.props.user,
                    walls: [
                        {
                            id: wallID,
                            succeeded: false,
                        },
                        ...this.props.user.walls,
                    ],
                }
            }
            else { // wall exists, update to front
                newUserInst = {
                    ...this.props.user,
                    walls: [
                        this.props.user.walls[userWallIndex],
                        ...this.props.user.walls.slice(0, userWallIndex),
                        ...this.props.user.walls.slice(userWallIndex + 1),
                    ],
                }
            }
        }
        socket.emit(actions.UPDATE_USER_INST, newUserInst)
        this.props.navigation.navigate('rockwall', { wallID: wallID })
    }

    render() {
        return (
            <QRCodeScanner
                topViewStyle={styles.container}
                bottomViewStyle={styles.container}
                onRead={this.onSuccess.bind(this)}
                topContent={
                    <Text style={styles.text}>Scan a wall's QR code</Text>
                }
                bottomContent={
                    <TouchableOpacity style={styles.buttonTouchable}>
                        <Text style={styles.text}>just hover the camera</Text>
                    </TouchableOpacity>
                }
            />
        )
    }
}
