package com.friendsapp.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun CallScreen(
    peerName: String,
    mediaType: String, // "AUDIO" or "VIDEO"
    onEndCall: () -> Unit
) {
    var isMuted by remember { mutableStateOf(false) }
    var isVideoDisabled by remember { mutableStateOf(false) }
    var isSpeakerOn by remember { mutableStateOf(true) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121212))
    ) {
        // Main Video Area or Audio Avatar
        if (mediaType == "VIDEO" && !isVideoDisabled) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF1E293B)),
                contentAlignment = Alignment.Center
            ) {
                // In production: Android SurfaceViewRenderer attached to WebRTC VideoTrack
                Text("[Remote WebRTC Video Stream: $peerName]", color = Color.White)

                // Picture-in-picture local preview
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                        .size(100.dp, 140.dp)
                        .background(Color.Black, MaterialTheme.shapes.medium),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Local Stream", color = Color.Gray, style = MaterialTheme.typography.bodySmall)
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 100.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(140.dp)
                        .background(MaterialTheme.colorScheme.primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = Color.White, modifier = Modifier.size(72.dp))
                }
                Spacer(Modifier.height(16.dp))
                Text(peerName, style = MaterialTheme.typography.headlineMedium, color = Color.White)
                Spacer(Modifier.height(8.dp))
                Text("02:14 • Connected", color = Color.Green, style = MaterialTheme.typography.bodyLarge)
            }
        }

        // Call Controls Bottom Bar
        Surface(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(24.dp),
            color = Color(0x99000000),
            shape = CircleShape
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Mute Mic
                IconButton(
                    onClick = { isMuted = !isMuted },
                    modifier = Modifier.background(if (isMuted) Color.White else Color(0x33FFFFFF), CircleShape)
                ) {
                    Icon(
                        if (isMuted) Icons.Default.MicOff else Icons.Default.Mic,
                        contentDescription = "Mute",
                        tint = if (isMuted) Color.Black else Color.White
                    )
                }

                // Camera Toggle
                if (mediaType == "VIDEO") {
                    IconButton(
                        onClick = { isVideoDisabled = !isVideoDisabled },
                        modifier = Modifier.background(if (isVideoDisabled) Color.White else Color(0x33FFFFFF), CircleShape)
                    ) {
                        Icon(
                            if (isVideoDisabled) Icons.Default.VideocamOff else Icons.Default.Videocam,
                            contentDescription = "Camera",
                            tint = if (isVideoDisabled) Color.Black else Color.White
                        )
                    }
                }

                // Speakerphone
                IconButton(
                    onClick = { isSpeakerOn = !isSpeakerOn },
                    modifier = Modifier.background(if (isSpeakerOn) Color.White else Color(0x33FFFFFF), CircleShape)
                ) {
                    Icon(
                        if (isSpeakerOn) Icons.Default.VolumeUp else Icons.Default.VolumeDown,
                        contentDescription = "Speaker",
                        tint = if (isSpeakerOn) Color.Black else Color.White
                    )
                }

                // Hangup Button
                IconButton(
                    onClick = onEndCall,
                    modifier = Modifier.background(Color(0xFFDC2626), CircleShape)
                ) {
                    Icon(Icons.Default.CallEnd, contentDescription = "End Call", tint = Color.White)
                }
            }
        }
    }
}
