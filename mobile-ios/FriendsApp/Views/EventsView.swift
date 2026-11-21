import SwiftUI

struct EventModelIOS: Identifiable {
    let id: String
    let title: String
    let venue: String
    let distanceKm: Double
    let price: Int
    let date: String
}

struct EventsView: View {
    @State private var radiusKm: Double = 25
    @State private var bookedAlert: String?

    let events = [
        EventModelIOS(id: "evt-1", title: "Grand Coastal Music & Indie Fest", venue: "Bolgatty Palace, Kochi", distanceKm: 4.2, price: 499, date: "Nov 20-22"),
        EventModelIOS(id: "evt-2", title: "Kochi Tech Creators & Film Con", venue: "Kaloor Stadium, Kochi", distanceKm: 6.8, price: 349, date: "Dec 05-06")
    ]

    var body: some View {
        VStack(spacing: 12) {
            // Radius Filter
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Search Radius")
                        .font(.caption.bold())
                    Spacer()
                    Text("\(Int(radiusKm)) km")
                        .font(.caption.bold())
                        .foregroundColor(.blue)
                }
                Slider(value: $radiusKm, in: 5...100, step: 5)
            }
            .padding()
            .background(Color(white: 0.15))
            .cornerRadius(12)
            .padding(.horizontal)

            if let msg = bookedAlert {
                Text(msg)
                    .font(.caption.bold())
                    .foregroundColor(.green)
                    .padding(8)
            }

            List(events) { event in
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("\(String(format: "%.1f", event.distanceKm)) km away")
                            .font(.caption2.bold())
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(Color.blue.opacity(0.2))
                            .foregroundColor(.blue)
                            .cornerRadius(8)

                        Spacer()
                        Text(event.date)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }

                    Text(event.title)
                        .font(.headline)

                    Text(event.venue)
                        .font(.caption)
                        .foregroundColor(.secondary)

                    HStack {
                        Text("₹\(event.price)")
                            .font(.headline)
                            .foregroundColor(.yellow)

                        Spacer()

                        Button(action: {
                            bookedAlert = "Ticket confirmed for \(event.title)! Apple Wallet Pass generated."
                        }) {
                            Label("Book Ticket", systemImage: "ticket")
                                .font(.caption.bold())
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
                .padding(.vertical, 4)
            }
            .listStyle(.plain)
        }
    }
}
