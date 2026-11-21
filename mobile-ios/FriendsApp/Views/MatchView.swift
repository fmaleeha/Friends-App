import SwiftUI

struct MatchView: View {
    @State private var isSearching = false
    @State private var mediaType = "AUDIO" // "AUDIO" or "VIDEO"
    @State private var isCallActive = false
    @State private var rippleScale: CGFloat = 1.0

    var body: some View {
        if isCallActive {
            ActiveCallView(peerName: "Sneha Krishna", mediaType: mediaType) {
                isCallActive = false
                isSearching = false
            }
        } else {
            VStack(spacing: 24) {
                Spacer()

                Text("Random Friend Connect")
                    .font(.title2.bold())

                Text("Connect 1-on-1 instantly with verified online friends via real-time WebRTC audio & video.")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                // Audio vs Video Toggle
                Picker("Media Mode", selection: $mediaType) {
                    Text("Audio Call").tag("AUDIO")
                    Text("Video Call").tag("VIDEO")
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 48)
                .disabled(isSearching)

                Spacer()

                if isSearching {
                    ZStack {
                        Circle()
                            .fill(Color.blue.opacity(0.2))
                            .frame(width: 180, height: 180)
                            .scaleEffect(rippleScale)
                            .onAppear {
                                withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                                    rippleScale = 1.35
                                }
                            }

                        Circle()
                            .fill(Color.blue)
                            .frame(width: 100, height: 100)

                        Image(systemName: mediaType == "AUDIO" ? "waveform" : "video.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.white)
                    }

                    Text("Finding online friends...")
                        .font(.headline)

                    Button("Cancel") {
                        isSearching = false
                    }
                    .foregroundColor(.red)
                } else {
                    Button(action: {
                        isSearching = true
                    }) {
                        ZStack {
                            Circle()
                                .fill(Color.blue)
                                .frame(width: 110, height: 110)
                                .shadow(color: Color.blue.opacity(0.4), radius: 10, x: 0, y: 5)

                            Image(systemName: "play.fill")
                                .font(.system(size: 44))
                                .foregroundColor(.white)
                        }
                    }

                    Text("Tap to Find Match")
                        .font(.subheadline.bold())
                        .foregroundColor(.blue)
                }

                Spacer()
            }
            .padding()
        }
    }
}
