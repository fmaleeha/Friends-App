package com.friendsapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.friendsapp.ui.screens.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                FriendsAppRootScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FriendsAppRootScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    var userCoinBalance by remember { mutableStateOf(250) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Friends App", style = MaterialTheme.typography.titleLarge) },
                actions = {
                    Surface(
                        shape = MaterialTheme.shapes.small,
                        color = MaterialTheme.colorScheme.primaryContainer,
                        modifier = Modifier.padding(end = androidx.compose.ui.unit.dp(12))
                    ) {
                        Row(modifier = Modifier.padding(horizontal = androidx.compose.ui.unit.dp(8), vertical = androidx.compose.ui.unit.dp(4))) {
                            Icon(Icons.Default.MonetizationOn, contentDescription = "Coins", tint = MaterialTheme.colorScheme.primary)
                            Spacer(Modifier.width(androidx.compose.ui.unit.dp(4)))
                            Text("$userCoinBalance Coins", style = MaterialTheme.typography.labelLarge)
                        }
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    icon = { Icon(Icons.Default.PhoneCallback, "Match") },
                    label = { Text("Random Call") }
                )
                NavigationBarItem(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    icon = { Icon(Icons.Default.Star, "Celebrities") },
                    label = { Text("Celebrities") }
                )
                NavigationBarItem(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2 },
                    icon = { Icon(Icons.Default.Event, "Events") },
                    label = { Text("Events") }
                )
                NavigationBarItem(
                    selected = selectedTab == 3,
                    onClick = { selectedTab = 3 },
                    icon = { Icon(Icons.Default.SupportAgent, "Support") },
                    label = { Text("Support") }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (selectedTab) {
                0 -> MatchScreen()
                1 -> CelebrityScreen(coinBalance = userCoinBalance)
                2 -> EventsScreen()
                3 -> SupportDeskScreen()
            }
        }
    }
}

@Composable
fun SupportDeskScreen() {
    Column(modifier = Modifier.padding(androidx.compose.ui.unit.dp(16))) {
        Text("Customer Care & Helpdesk", style = MaterialTheme.typography.headlineSmall)
        Spacer(Modifier.height(androidx.compose.ui.unit.dp(8)))
        Text("Connect instantly with 24/7 dedicated support via text or direct WebRTC audio/video callback.")
        Spacer(Modifier.height(androidx.compose.ui.unit.dp(16)))
        Button(onClick = { /* Trigger support request */ }, modifier = Modifier.fillMaxWidth()) {
            Icon(Icons.Default.Call, contentDescription = null)
            Spacer(Modifier.width(androidx.compose.ui.unit.dp(8)))
            Text("Request Support Audio Call")
        }
    }
}
