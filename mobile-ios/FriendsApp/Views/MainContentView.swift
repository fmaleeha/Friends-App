import SwiftUI

struct MainContentView: View {
    @State private var selectedTab = 0
    @State private var coinBalance = 250

    var body: some View {
        NavigationView {
            TabView(selection: $selectedTab) {
                MatchView()
                    .tabItem {
                        Label("Random Call", systemImage: "phone.circle.fill")
                    }
                    .tag(0)

                CelebrityView(coinBalance: $coinBalance)
                    .tabItem {
                        Label("Celebrities", systemImage: "star.fill")
                    }
                    .tag(1)

                EventsView()
                    .tabItem {
                        Label("Nearby Events", systemImage: "ticket.fill")
                    }
                    .tag(2)

                SupportDeskView()
                    .tabItem {
                        Label("Support", systemImage: "headphones.circle.fill")
                    }
                    .tag(3)
            }
            .navigationTitle("Friends App")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    HStack(spacing: 4) {
                        Image(systemName: "circle.circle.fill")
                            .foregroundColor(.yellow)
                        Text("\(coinBalance) Coins")
                            .font(.caption.bold())
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.yellow.opacity(0.15))
                    .cornerRadius(12)
                }
            }
        }
    }
}
