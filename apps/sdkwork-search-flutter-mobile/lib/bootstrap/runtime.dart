Map<String, dynamic> createRuntimeConfig() {
  return {
    'environment': const String.fromEnvironment('ENVIRONMENT', defaultValue: 'development'),
  };
}
