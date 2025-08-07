'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Settings } from 'lucide-react';

export interface MetadataSettings {
    titleLength: number;
    keywordFormat: 'Single Only' | 'Double Only' | 'Mixed';
    keywordCount: number;
    descriptionLength: number;
    includeKeywords: string;
    excludeKeywords: string;
}

interface MetadataSettingsProps {
    settings: MetadataSettings;
    onSettingsChange: (settings: MetadataSettings) => void;
}

export function MetadataSettings({ settings, onSettingsChange }: MetadataSettingsProps) {
    const handleSliderChange = (key: keyof MetadataSettings, value: number[]) => {
        onSettingsChange({ ...settings, [key]: value[0] });
    };

    const handleValueChange = (key: keyof MetadataSettings, value: string | number) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="text-primary" /> AI Output Settings
                </CardTitle>
                <CardDescription>
                    Customize the generated metadata to fit your needs.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="title-length">Title Length</Label>
                        <span className="text-sm text-muted-foreground">{settings.titleLength} chars</span>
                    </div>
                    <Slider
                        id="title-length"
                        min={30}
                        max={150}
                        step={1}
                        value={[settings.titleLength]}
                        onValueChange={(value) => handleSliderChange('titleLength', value)}
                    />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="description-length">Description Length</Label>
                        <span className="text-sm text-muted-foreground">{settings.descriptionLength} chars</span>
                    </div>
                    <Slider
                        id="description-length"
                        min={50}
                        max={250}
                        step={1}
                        value={[settings.descriptionLength]}
                        onValueChange={(value) => handleSliderChange('descriptionLength', value)}
                    />
                </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="keyword-count">Keyword Count</Label>
                        <span className="text-sm text-muted-foreground">{settings.keywordCount} keywords</span>
                    </div>
                    <Slider
                        id="keyword-count"
                        min={1}
                        max={50}
                        step={1}
                        value={[settings.keywordCount]}
                        onValueChange={(value) => handleSliderChange('keywordCount', value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="keyword-format">Keyword Format</Label>
                    <Select
                        value={settings.keywordFormat}
                        onValueChange={(value: MetadataSettings['keywordFormat']) => handleValueChange('keywordFormat', value)}
                    >
                        <SelectTrigger id="keyword-format">
                            <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                            <SelectItem value="Single Only">Single Only</SelectItem>
                            <SelectItem value="Double Only">Double Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="include-keywords">Include Keywords</Label>
                    <Input
                        id="include-keywords"
                        placeholder="e.g., product, e-commerce, seo"
                        value={settings.includeKeywords}
                        onChange={(e) => handleValueChange('includeKeywords', e.target.value)}
                    />
                     <p className="text-xs text-muted-foreground">Comma-separated keywords to always include.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="exclude-keywords">Exclude Keywords</Label>
                    <Input
                        id="exclude-keywords"
                        placeholder="e.g., free, cheap, outdated"
                        value={settings.excludeKeywords}
                        onChange={(e) => handleValueChange('excludeKeywords', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated keywords to always exclude.</p>
                </div>
            </CardContent>
        </Card>
    );
}
