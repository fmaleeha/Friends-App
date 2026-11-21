package com.friendsapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class EventModel(
    val id: String,
    val title: String,
    val venue: String,
    val distanceKm: Double,
    val generalPrice: Int,
    val dateText: String
)

@Composable
fun EventsScreen() {
    var selectedRadiusKm by remember { mutableStateOf(25f) }
    var bookedSuccessMessage by remember { mutableStateOf<String?>(null) }

    val events = remember {
        listOf(
            EventModel("evt-1", "Grand Coastal Music & Indie Fest", "Bolgatty Palace, Kochi", 4.2, 499, "Nov 20-22, 2026"),
            EventModel("evt-2", "Kochi Tech Creators & Film Con", "Kaloor Stadium, Kochi", 6.8, 349, "Dec 05-06, 2026")
        )
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Nearby Events & Tickets", style = MaterialTheme.typography.headlineSmall)
        Text("Discovered using PostGIS GPS coordinates", style = MaterialTheme.typography.bodySmall)

        Spacer(Modifier.height(12.dp))

        // Distance Radius Slider
        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Search Radius", style = MaterialTheme.typography.labelLarge)
                    Text("${selectedRadiusKm.toInt()} km", color = MaterialTheme.colorScheme.primary)
                }
                Slider(
                    value = selectedRadiusKm,
                    onValueChange = { selectedRadiusKm = it },
                    valueRange = 5f..100f
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        if (bookedSuccessMessage != null) {
            Surface(
                color = MaterialTheme.colorScheme.secondaryContainer,
                shape = MaterialTheme.shapes.medium,
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                    Spacer(Modifier.width(8.dp))
                    Text(bookedSuccessMessage!!, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }

        LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            items(events.size) { idx ->
                val event = events[idx]
                OutlinedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Badge { Text("${event.distanceKm} km away") }
                            Text(event.dateText, style = MaterialTheme.typography.labelSmall)
                        }

                        Spacer(Modifier.height(8.dp))
                        Text(event.title, style = MaterialTheme.typography.titleMedium)
                        Text(event.venue, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)

                        Spacer(Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("From ₹${event.generalPrice}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                            Button(
                                onClick = {
                                    bookedSuccessMessage = "Booked pass for ${event.title}! QR token generated."
                                }
                            ) {
                                Icon(Icons.Default.ConfirmationNumber, contentDescription = null)
                                Spacer(Modifier.width(6.dp))
                                Text("Book Ticket")
                            }
                        }
                    }
                }
            }
        }
    }
}
