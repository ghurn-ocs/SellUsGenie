// Test the fixed checkBucketExists function
import { checkBucketExists } from './src/lib/storage.js'
import dotenv from 'dotenv'

dotenv.config()

async function testBucketCheck() {
  console.log('🔍 Testing fixed checkBucketExists function...')
  
  try {
    const exists = await checkBucketExists('product-images')
    console.log(`✅ checkBucketExists('product-images'): ${exists}`)
    
    const nonExistent = await checkBucketExists('non-existent-bucket')
    console.log(`✅ checkBucketExists('non-existent-bucket'): ${nonExistent}`)
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testBucketCheck()