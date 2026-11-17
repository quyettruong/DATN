import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:medicare_patient_app/main.dart';
import 'package:medicare_patient_app/providers/auth_provider.dart';

void main() {
  testWidgets('MediCareApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => AuthProvider()),
        ],
        child: const MediCareApp(),
      ),
    );

    // Initial frame displays either splash loading or login title
    await tester.pump();
    expect(find.byType(MediCareApp), findsOneWidget);
  });
}
