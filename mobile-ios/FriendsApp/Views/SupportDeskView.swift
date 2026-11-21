import SwiftUI

struct SupportDeskView: View {
    @State private var requestedCall = false

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "headphones.circle.fill")
                .font(.system(size: 72))
                .foregroundColor(.blue)

            Text("24/7 Customer Care")
                .font(.title2.bold())

            Text("Need help with an event ticket, celebrity call billing, or account concerns? Our agents can call you directly via WebRTC.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            if requestedCall {
                Text("Support agent notified! Connecting incoming audio call shortly...")
                    .font(.caption.bold())
                    .foregroundColor(.green)
                    .padding()
            }

            Button(action: {
                requestedCall = true
            }) {
                Label("Request Immediate Support Call", systemImage: "phone.badge.waveform.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .padding(.horizontal)

            Spacer()
        }
        .padding(.top, 40)
    }
}
