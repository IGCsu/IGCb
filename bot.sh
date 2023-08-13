# Update repository
git --work-tree=/var/bot/IGCb --git-dir=/var/bot/IGCb/.git pull origin master

# Install dependencies
npm install

# Compile TypeScript
tsc

# Run bot
node index.js >> /var/log/bot/IGCb/last.log
