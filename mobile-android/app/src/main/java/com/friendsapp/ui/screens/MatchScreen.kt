package com.friendsapp.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.unit.dp

@Composable
fun MatchScreen() {
    var isSearching by remember { mutableStateOf(false) }
    var selectedMedia by remember { mutableStateOf("AUDIO") } // "AUDIO" or "VIDEO"
    var isCallActive by remember { mutableStateOf(false) }

    if (isCallActive) {
        CallScreen(
            peerName = "Sneha Krishna",
            mediaType = selectedMedia,
            onEndCall = {
                isCallActive = false
                isSearching = false
            }
        )
        return
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Random Friend Connect", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(8.dp))
        Text(
            "Connect instantly with random friends online across India & worldwide via real-time WebRTC.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(Modifier.height(32.dp))

        // Mode Selector: Audio vs Video
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center
        ) {
            FilterChip(
                selected = selectedMedia == "AUDIO",
                onClick = { if (!isSearching) selectedMedia = "AUDIO" },
                label = { Text("Audio Call") },
                leadingIcon = { Icon(Icons.Default.Mic, contentDescription = null) }
            )
            Spacer(Modifier.width(16.dp))
            FilterChip(
                selected = selectedMedia == "VIDEO",
                onClick = { if (!isSearching) selectedMedia = "VIDEO" },
                label = { Text("Video Call") },
                leadingIcon = { Icon(Icons.Default.Videocam, contentDescription = null) }
            )
        }

        Spacer(Modifier.height(48.dp))

        // Radar Ripple when Searching
        if (isSearching) {
            val infiniteTransition = rememberInfiniteTransition(label = "radar")
            val scale by infiniteTransition.animateFloat(
                initialValue = 0.8f,
                targetValue = 1.4f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1200, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "scale"
            )

            Box(contentAlignment = Alignment.Center) {
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .scale(scale)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.2f), CircleShape)
                )
                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .background(MaterialTheme.colorScheme.primary, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        if (selectedMedia == "AUDIO") Icons.Default.Headphones else Icons.Default.Videocam,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.size(48.dp)
                    )
                }
            }

            Spacer(Modifier.height(32.dp))
            Text("Searching for online peer...", style = MaterialTheme.typography.titleMedium)
            Text("Waiting in queue (Pos: #1)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.primary)

            Spacer(Modifier.height(24.dp))
            OutlinedButton(onClick = { isSearching = false }) {
                Text("Cancel Matchmaking")
            }
        } else {
            IconButton(
                onClick = {
                    isSearching = true
                    // Simulate auto-match after 3 seconds for demonstration
                },
                modifier = Modifier
                    .size(120.dp)
                    .background(MaterialTheme.colorScheme.primaryContainer, CircleShape)
            ) {
                Icon(
                    Icons.Default.PlayArrow,
                    contentDescription = "Start Matching",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(64.dp)
                )
            }

            Spacer(Modifier.height(24.dp))
            Button(
                onClick = { isSearching = true },
                modifier = Modifier.fillMaxWidth(0.7f)
            ) {
                Text("Find Random Friend Now")
            }
        }
    }
}
