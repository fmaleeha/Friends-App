import SwiftUI

struct CelebrityModelIOS: Identifiable {
    let id: String
    let name: String
    let category: String
    let audioRate: Int
    let videoRate: Int
    let rating: Double
}

struct CelebrityView: View {
    @Binding var coinBalance: Int
    @State private var activeCallCelebrity: CelebrityModelIOS?
    @State private var callMediaType = "AUDIO"

    let celebrities = [
        CelebrityModelIOS(id: "celeb-1", name: "Arjun Das", category: "Actor & Voice Artist", audioRate: 40, videoRate: 80, rating: 4.95),
        CelebrityModelIOS(id: "celeb-2", name: "Priya Mohan", category: "Playback Singer", audioRate: 30, videoRate: 60, rating: 4.88),
        CelebrityModelIOS(id: "celeb-3", name: "Kiran Varma", category: "Comedian & Podcaster", audioRate: 25, videoRate: 50, rating: 4.75)
    ]

    var body: some View {
        if let celeb = activeCallCelebrity {
            ActiveCallView(peerName: celeb.name, mediaType: callMediaType) {
                activeCallCelebrity = nil
            }
        } else {
            List(celebrities) { celeb in
                HStack(spacing: 16) {
                    Circle()
                        .fill(Color.orange.opacity(0.2))
                        .frame(width: 52, height: 52)
                        .overlay(
                            Image(systemName: "star.fill")
                                .foregroundColor(.orange)
                        )

                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(celeb.name)
                                .font(.headline)
                            Image(systemName: "checkmark.seal.fill")
                                .font(.caption)
                                .foregroundColor(.blue)
                        }
                        Text(celeb.category)
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("Audio: \(celeb.audioRate)c/m • Video: \(celeb.videoRate)c/m")
                            .font(.caption2.bold())
                            .foregroundColor(.yellow)
                    }

                    Spacer()

                    VStack(spacing: 6) {
                        Button("Call") {
                            callMediaType = "AUDIO"
                            activeCallCelebrity = celeb
                        }
                        .font(.caption.bold())
                        .buttonStyle(.borderedProminent)

                        Button("Video") {
                            callMediaType = "VIDEO"
                            activeCallCelebrity = celeb
                        }
                        .font(.caption.bold())
                        .buttonStyle(.bordered)
                    }
                }
                .padding(.vertical, 6)
            }
            .listStyle(.insetGrouped)
        }
    }
}
