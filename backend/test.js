const bcrypt = require('bcryptjs');

async function test() {
  const result = await bcrypt.compare(
    'hospital0@123',
    '$2a$10$E2HYza3YAFAHJtZC3HoGQeqI9C3MK5joJesFPjfsoC2DSVMcxxev6'
  );
  console.log('Match:', result);
}
console.log("Hello");
test();
