package com.friendsapp.telecom

import android.telecom.Connection
import android.telecom.ConnectionRequest
import android.telecom.ConnectionService
import android.telecom.PhoneAccountHandle

/**
 * Android Telecom ConnectionService
 * Enables Native Full-Screen Incoming Phone Call Ringing & CallStyle Notifications
 */
class FriendsConnectionService : ConnectionService() {

    override fun onCreateIncomingConnection(
        connectionManagerPhoneAccount: PhoneAccountHandle?,
        request: ConnectionRequest?
    ): Connection {
        return object : Connection() {
            init {
                connectionCapabilities = CAPABILITY_MUTE or CAPABILITY_SUPPORT_HOLD
                setInitializing()
                setActive()
            }

            override fun onAnswer() {
                super.onAnswer()
                setActive()
                // Notify WebRTC Signaling that call was answered
            }

            override fun onDisconnect() {
                super.onDisconnect()
                setDisconnected(android.telecom.DisconnectCause(android.telecom.DisconnectCause.LOCAL))
                destroy()
            }
        }
    }
}
