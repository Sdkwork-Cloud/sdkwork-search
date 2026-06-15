String getRuntimeEnvironment() {
  return const String.fromEnvironment('ENVIRONMENT', defaultValue: 'development');
}
