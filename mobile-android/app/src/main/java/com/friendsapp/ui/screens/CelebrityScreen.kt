package com.friendsapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class CelebrityModel(
    val id: String,
    val name: String,
    val category: String,
    val audioRate: Int,
    val videoRate: Int,
    val isOnline: Boolean,
    val rating: Double
)

@Composable
fun CelebrityScreen(coinBalance: Int) {
    val celebrities = remember {
        listOf(
            CelebrityModel("celeb-1", "Arjun Das", "Actor & Voice Artist", 40, 80, true, 4.95),
            CelebrityModel("celeb-2", "Priya Mohan", "Playback Singer", 30, 60, true, 4.88),
            CelebrityModel("celeb-3", "Kiran Varma", "Comedian & Podcaster", 25, 50, false, 4.75)
        )
    }

    var activeCallingCelebrity by remember { mutableStateOf<CelebrityModel?>(null) }
    var selectedMediaType by remember { mutableStateOf("AUDIO") }

    if (activeCallingCelebrity != null) {
        CallScreen(
            peerName = activeCallingCelebrity!!.name,
            mediaType = selectedMediaType,
            onEndCall = { activeCallingCelebrity = null }
        )
        return
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Celebrity Connect", style = MaterialTheme.typography.headlineSmall)
                Text("Call verified stars using per-minute coins", style = MaterialTheme.typography.bodySmall)
            }
            AssistChip(
                onClick = { /* Top up wallet */ },
                label = { Text("Recharge") },
                leadingIcon = { Icon(Icons.Default.Add, contentDescription = null) }
            )
        }

        Spacer(Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(celebrities.size) { idx ->
                val celeb = celebrities[idx]
                ElevatedCard(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            modifier = Modifier.size(56.dp),
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.secondaryContainer
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.Star, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                            }
                        }

                        Spacer(Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(celeb.name, style = MaterialTheme.typography.titleMedium)
                                Spacer(Modifier.width(4.dp))
                                Icon(Icons.Default.CheckCircle, contentDescription = "Verified", tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
                            }
                            Text(celeb.category, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Spacer(Modifier.height(4.dp))
                            Text("Audio: ${celeb.audioRate}c/m • Video: ${celeb.videoRate}c/m", style = MaterialTheme.typography.labelSmall)
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            FilledTonalButton(
                                onClick = {
                                    selectedMediaType = "AUDIO"
                                    activeCallingCelebrity = celeb
                                },
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.Call, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Call")
                            }

                            Spacer(Modifier.height(6.dp))

                            OutlinedButton(
                                onClick = {
                                    selectedMediaType = "VIDEO"
                                    activeCallingCelebrity = celeb
                                },
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.Videocam, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Video")
                            }
                        }
                    }
                }
            }
        }
    }
}
