<?php

namespace App\Services;

use App\Enums\UserType;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use UtxoOne\TwitterUltimatePhp\Clients\TweetClient;
use UtxoOne\TwitterUltimatePhp\Clients\UserClient;
use UtxoOne\TwitterUltimatePhp\Models\Users as TwitterUsers;

class CrawlerService
{
    public function crawlBitcoiners(?int $limit = 1): void
    {
        $userClient = new UserClient(bearerToken: config('services.twitter.bearer_token'));

        $bitcoiner = User::query()
            ->where('type', UserType::BITCOINER)
            ->where('last_crawled_at', NULL)
            ->where('twitter_count_followers', '>', 1000)
            ->where('twitter_count_followers', '<', 8000)
            ->where('twitter_count_following', '<', 5000)
            ->inRandomOrder()
            ->first();

        $userService = new UserService();
        $twitterUser = $userClient->getUserById($bitcoiner->twitter_id);
        $userService->processTwitterUser($twitterUser);

        $bitcoiner->last_crawled_at = Carbon::now();

        $tweetClient = new TweetClient(bearerToken: config('services.twitter.bearer_token'));

        $tweets = $tweetClient->getTimeline(
            userId: $bitcoiner->twitter_id,
            maxResults: 10
        );

        $tweetService = new TweetService();
        $tweets = $tweetService->saveTweets($tweets, $bitcoiner);
        
        $bitcoiner->last_timeline_saved_at = Carbon::now();
        $bitcoiner->save();

        Log::info('Crawled bitcoiner ' . $bitcoiner->twitter_username . ' with ' . $bitcoiner->twitter_count_followers . ' followers');
    }

    public function saveBitcoinerTweets(?int $limit = 50): void
    {
        $tweetClient = new TweetClient(bearerToken: config('services.twitter.bearer_token'));

        // Select 5 Users with type bitcoiner and last_timeline_saved_at older than 1 day
        $bitcoiners = User::query()
            ->where('type', UserType::BITCOINER)
            ->where(function ($query) {
                $query->where('last_timeline_saved_at', '<', now()->subDay());
            })
            ->inRandomOrder()
            ->limit($limit)
            ->get();

        // Foreach bitcoiner, get their timeline, and save each tweet
        foreach ($bitcoiners as $bitcoiner) {
            $tweets = $tweetClient->getTimeline(
                userId: $bitcoiner->twitter_id,
                maxResults: 5
            );

            $tweetService = new TweetService();
            $tweets = $tweetService->saveTweets($tweets, $bitcoiner);
            $bitcoiner->last_timeline_saved_at = Carbon::now();
            $bitcoiner->save();
            Log::info('Saved ' . count($tweets) . ' tweets for ' . $bitcoiner->twitter_username);
        }
    }
}
