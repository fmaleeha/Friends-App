import SwiftUI

struct ActiveCallView: View {
    let peerName: String
    let mediaType: String
    let onEndCall: () -> Void

    @State private var isMuted = false
    @State private var isVideoDisabled = false
    @State private var isSpeakerOn = true

    var body: some View {
        ZStack {
            Color.black.edgesIgnoringSafeArea(.all)

            if mediaType == "VIDEO" && !isVideoDisabled {
                // WebRTC Video Render Container
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(white: 0.15))
                        .overlay(
                            Text("[Remote WebRTC Video: \(peerName)]")
                                .foregroundColor(.white)
                        )

                    // Local Camera PIP View
                    VStack {
                        HStack {
                            Spacer()
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.black)
                                .frame(width: 90, height: 130)
                                .overlay(
                                    Text("Local")
                                        .font(.caption2)
                                        .foregroundColor(.gray)
                                )
                                .padding()
                        }
                        Spacer()
                    }
                }
            } else {
                VStack(spacing: 20) {
                    Spacer()

                    Image(systemName: "person.crop.circle.fill")
                        .font(.system(size: 90))
                        .foregroundColor(.blue)

                    Text(peerName)
                        .font(.title.bold())
                        .foregroundColor(.white)

                    Text("01:45 • Connected via WebRTC")
                        .font(.subheadline)
                        .foregroundColor(.green)

                    Spacer()
                }
            }

            // Controls Bar
            VStack {
                Spacer()
                HStack(spacing: 28) {
                    // Mute
                    Button(action: { isMuted.toggle() }) {
                        Image(systemName: isMuted ? "mic.slash.fill" : "mic.fill")
                            .font(.title2)
                            .padding()
                            .background(isMuted ? Color.white : Color.white.opacity(0.2))
                            .foregroundColor(isMuted ? .black : .white)
                            .clipShape(Circle())
                    }

                    // Camera
                    if mediaType == "VIDEO" {
                        Button(action: { isVideoDisabled.toggle() }) {
                            Image(systemName: isVideoDisabled ? "video.slash.fill" : "video.fill")
                                .font(.title2)
                                .padding()
                                .background(isVideoDisabled ? Color.white : Color.white.opacity(0.2))
                                .foregroundColor(isVideoDisabled ? .black : .white)
                                .clipShape(Circle())
                        }
                    }

                    // Speaker
                    Button(action: { isSpeakerOn.toggle() }) {
                        Image(systemName: isSpeakerOn ? "speaker.wave.3.fill" : "speaker.fill")
                            .font(.title2)
                            .padding()
                            .background(isSpeakerOn ? Color.white : Color.white.opacity(0.2))
                            .foregroundColor(isSpeakerOn ? .black : .white)
                            .clipShape(Circle())
                    }

                    // End Call
                    Button(action: onEndCall) {
                        Image(systemName: "phone.down.fill")
                            .font(.title2)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .clipShape(Circle())
                    }
                }
                .padding(.bottom, 36)
            }
        }
    }
}
