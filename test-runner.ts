import { Notification } from "./src";

async function runTests(): Promise<void> {
  console.log("===========================================");
  console.log("Riwayat Notification SDK - Test Runner");
  console.log("===========================================\n");

  // Test 1: Send a valid TEST_EVENT
  console.log("Test 1: Sending TEST_EVENT...");
  try {
    const result = await Notification.send("TEST_EVENT", {
      test_id: "test-001",
      message: "Hello from test runner",
      timestamp: new Date().toISOString(),
    });
    console.log("✓ TEST_EVENT result:", result, "\n");
  } catch (error) {
    console.error("✗ TEST_EVENT failed:", (error as Error).message, "\n");
  }

  // Test 2: Send KITCHEN_CREATED event
  console.log("Test 2: Sending KITCHEN_CREATED event...");
  try {
    const result = await Notification.send("KITCHEN_CREATED", {
      kitchen_id: "k123",
      chef_name: "Asim",
      city: "Karachi",
      created_at: new Date().toISOString(),
    });
    console.log("✓ KITCHEN_CREATED result:", result, "\n");
  } catch (error) {
    console.error("✗ KITCHEN_CREATED failed:", (error as Error).message, "\n");
  }

  // Test 3: Send ORDER_PLACED event
  console.log("Test 3: Sending ORDER_PLACED event...");
  try {
    const result = await Notification.send("ORDER_PLACED", {
      order_id: "ord-456",
      customer_name: "John Doe",
      total_amount: 150.0,
      currency: "PKR",
    });
    console.log("✓ ORDER_PLACED result:", result, "\n");
  } catch (error) {
    console.error("✗ ORDER_PLACED failed:", (error as Error).message, "\n");
  }

  // Test 4: Validation - Empty eventCode (should fail)
  console.log("Test 4: Testing validation - empty eventCode...");
  try {
    await Notification.send("", { test: "data" });
    console.log("✗ Should have thrown validation error\n");
  } catch (error) {
    console.log("✓ Validation working correctly:", (error as Error).message, "\n");
  }

  // Test 5: Validation - Invalid payload (should fail)
  console.log("Test 5: Testing validation - invalid payload...");
  try {
    await Notification.send("TEST_EVENT", null as unknown as Record<string, unknown>);
    console.log("✗ Should have thrown validation error\n");
  } catch (error) {
    console.log("✓ Validation working correctly:", (error as Error).message, "\n");
  }

  // Cleanup
  console.log("Closing connection...");
  await Notification.close();

  console.log("\n===========================================");
  console.log("All tests completed!");
  console.log("===========================================");
}

runTests().catch((error) => {
  console.error("Test runner failed:", error);
  process.exit(1);
});
